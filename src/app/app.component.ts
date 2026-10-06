import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormBuilder, FormGroup , Validators , ReactiveFormsModule } from '@angular/forms';
import { AppService } from './app.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ReactiveFormsModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  protected readonly title = signal('crud_app');

  items: any[] = [];
  patientModal = false;
  isUpdate = false;
  id = '';
  maxDate = '';

  prefixList = [
    { id: 'นาย', name: 'นาย (Mr.)' },
    { id: 'นาง', name: 'นาง (Mrs.)' },
    { id: 'นางสาว', name: 'นางสาว (Ms.)' }
  ];

  genderList = [
    { id: 'M', name: 'ชาย (Male)' },
    { id: 'F', name: 'หญิง (Female)' },
    { id: 'O', name: 'อื่นๆ (Other)' }
  ];


  generatedCode: string = '';
  //endDate = moment().format('YYYY-MM-DD');

  patientForm!: FormGroup;

  constructor(
    public fb: FormBuilder,
    private dataService: AppService,
  ) { }

  ngOnInit() {
    this.buildForm();
    this.loadData();
    this.setMaxDate();
  }

  buildForm() {
    this.patientForm = this.fb.group({
      hn: [],
      cid: [],
      prefix: [],
      first_name: [],
      last_name: [],
      gender: [],
      birth_date: [],
      phone: [],
      address: [],
      created_at: [],
      updated_at: [],

    });
  }

  // (Read) โหลดข้อมูลมาแสดง
  loadData() {
    this.dataService.getItems().subscribe((data : any) => {
      this.items = data;
      console.log('data', data)
    });
  }

  // (Create) รับค่าจาก HTML มาบันทึก
  addNew() {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // 1. เช็คฟอร์มก่อน
    console.log('patientForm value', this.patientForm.value);
    if (this.patientForm.invalid) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    const newItem = this.patientForm.value;

    if(this.isUpdate){
      newItem.updated_at = todayStr; // อัปเดตเวลาที่แก้ไข
      this.dataService.updateItem(this.id, newItem).subscribe(() => {
        this.loadData();
        this.patientForm.reset();    // ล้างข้อมูลในฟอร์ม
        this.patientModal = false;   // ปิด Modal

        // รีเซ็ตสถานะกลับเป็นโหมด "เพิ่มข้อมูล" เผื่อการกดครั้งต่อไป
        this.isUpdate = false;
        this.id = '';

        alert('บันทึกข้อมูลสำเร็จ!');
      });
    }else{
      newItem.hn = this.generateUniqueCode(); // กำหนดรหัสที่สร้างขึ้นให้กับ hn
      newItem.created_at = todayStr; // กำหนดเวลาที่สร้าง
      this.dataService.createItem(newItem).subscribe(() => {
        this.loadData();
        this.patientForm.reset();    // ล้างข้อมูลในฟอร์ม
        this.patientModal = false;   // ปิด Modal

        // รีเซ็ตสถานะกลับเป็นโหมด "เพิ่มข้อมูล" เผื่อการกดครั้งต่อไป
        this.isUpdate = false;
        this.id = '';

        alert('บันทึกข้อมูลสำเร็จ!');
      });
    }


    // 2. ตัดสินใจว่าจะใช้ API ตัวไหน (Update หรือ Create) แล้วเก็บไว้ในตัวแปร request$
    // const request$ = this.isUpdate
    //   ? this.dataService.updateItem(this.id, newItem)
    //   : this.dataService.createItem(newItem);

    // 3. สั่งทำงาน (Subscribe) แค่ที่เดียวจบ!
    // request$.subscribe({
    //   next: () => {
    //     this.loadData();              // อัปเดตตาราง
    //     this.patientForm.reset();    // ล้างข้อมูลในฟอร์ม
    //     this.patientModal = false;   // ปิด Modal

    //     // รีเซ็ตสถานะกลับเป็นโหมด "เพิ่มข้อมูล" เผื่อการกดครั้งต่อไป
    //     this.isUpdate = false;
    //     this.id = '';

    //     alert('บันทึกข้อมูลสำเร็จ!');
    //   },
    //   error: (error : any) => {
    //     console.error(error);
    //     alert('เกิดข้อผิดพลาด ไม่สามารถบันทึกข้อมูลได้');
    //   }
    // });
  }

  // (Delete) ลบข้อมูลตาม ID
  delete(id: string) {
    if (confirm('ต้องการลบสินค้านี้ใช่หรือไม่?')) {
      this.dataService.deleteItem(id).subscribe(() => {
        this.loadData(); // โหลดตารางใหม่หลังลบเสร็จ
      });
    }
  }

  openModal(item: any, mode: string) {
    const dbBirthDate = item.birth_date; 
    const dbCreatedAt = item.created_at;
    const dbUpdatedAt = item.updated_at;
    if (mode === 'edit' && item) {
      this.patientForm.patchValue({
        hn: item.hn,
        cid: item.cid,
        prefix: item.prefix,
        first_name: item.first_name,
        last_name: item.last_name,
        gender: item.gender,
        birth_date:dbBirthDate? dbBirthDate.split('T')[0] || '' : '',
        phone: item.phone,
        address: item.address,
        created_at: dbCreatedAt? dbCreatedAt.split('T')[0] || '' : '',
        updated_at: dbUpdatedAt? dbUpdatedAt.split('T')[0] || '' : ''
      });
      this.id = item.id;
      this.isUpdate = true;
    } else {
      this.patientForm.reset();
      this.isUpdate = false;
    }
    this.patientModal = true;
    console.log('openModal', item, mode, this.isUpdate);
  }

generateUniqueCode(): string { // เปลี่ยนจาก void เป็น string
  const idCardValue = this.patientForm.get('cid')?.value || '0000000000000';
  const lastThreeDigits = idCardValue.slice(-3);

  const now = new Date();
  const year = String(now.getFullYear()).slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  const timestamp = `${year}${month}${day}`;
  
  // ส่งค่ากลับออกไปตรงๆ
  return `${timestamp}${lastThreeDigits}`;
}

  setMaxDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    // ผลลัพธ์จะได้ เช่น "2026-10-06"
    this.maxDate = `${year}-${month}-${day}`; 
  }
}
