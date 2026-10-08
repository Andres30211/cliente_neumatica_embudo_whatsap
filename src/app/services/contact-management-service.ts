import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Contact, ContactImportResponse, ContactPage } from '../interfaces/ContactManagement';

@Injectable({
  providedIn: 'root',
})
export class ContactManagementService {

  // private readonly apiUrl = 'http://localhost:8080/api/contacts';
  private readonly apiUrl = 'https://neumatica-embudo-whatsap.onrender.com/api/contacts';

  constructor(
    private http: HttpClient
  ) {}

  /**
   * Obtener contactos paginados
   */
  getContacts(
    page: number = 0,
    size: number = 20
  ): Observable<ContactPage> {

    const params = new HttpParams()
      .set('page', page)
      .set('size', size);

    return this.http.get<ContactPage>(
      `${this.apiUrl}/getContacts`,
      { params }
    );
  }

  /**
   * Obtener un contacto por ID
   */
  getContactById(id: string): Observable<Contact> {

    return this.http.get<Contact>(
      `${this.apiUrl}/getContactById/${id}`
    );
  }

  /**
   * Importar contactos desde Excel
   */
  importContacts(file: File): Observable<ContactImportResponse> {

    const formData = new FormData();

    formData.append('file', file);

    return this.http.post<ContactImportResponse>(
      `${this.apiUrl}/import`,
      formData
    );
  }
  
}
