import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  // API_HOST = 'http://localhost:3000/api';
  API_HOST = 'https://blocks.raillmg.in/api';

  constructor(private httpClient: HttpClient) { }

  getData(): Observable<any> {
    return this.httpClient.get<any>(`${this.API_HOST}/stocks`);
  }
  updateRemark(id, data): Observable<any> {
    return this.httpClient.patch<any>(`${this.API_HOST}/stocks/updateRemark/${id}`, data);
  }
  updateData(id, data): Observable<any> {
    return this.httpClient.patch<any>(`${this.API_HOST}/stocks/${id}`, data);
  }
  loginUser(username, password): Observable<any> {
    return this.httpClient.get<any>(
      `${this.API_HOST}/users?username=${username}&password=${password}`
    );
  }
  // fetchDataApi(date): Observable<any> {
  //   return this.httpClient.get<any>(`${this.API_HOST}/stocks/${date}`)
  // }
}
