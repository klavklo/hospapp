import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor(
    private http: HttpClient
  ) { }

  private apiUrl = 'http://localhost:3000/api/patient'; 
  
  // ใช้ inject() แทน constructor
  //private http = inject(HttpClient); 

  getItems(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  createItem(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  updateItem(id: any, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteItem(id: any): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
