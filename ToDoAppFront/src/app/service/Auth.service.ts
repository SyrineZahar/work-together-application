import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../classe/User';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
    URL = 'http://localhost:8088/auth';

    constructor(private http: HttpClient) {}

    // Fonction pour enregistrer un nouvel utilisateur
    registerUser(user: User): Observable<User> {
        return this.http.post<User>(`${this.URL}/register`, user);
    }

    // Fonction pour se connecter
    login(email: string, password: string): Observable<any> {
        const loginData = { email, password };
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' }); 
        
        return this.http.post<any>(`${this.URL}/login`, loginData, { headers });
    }

    // Fonction pour enregistrer l'utilisateur connecté dans la session
    setUser(user: User) {
        sessionStorage.setItem('user', JSON.stringify(user));
    }

    // Fonction pour récupérer les informations de l'utilisateur connecté
    getUser(): User | null {
        const user = sessionStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    // Vérifier si un utilisateur est connecté
    isLoggedIn(): boolean {
        return this.getUser() !== null;
    }

    // Fonction pour déconnecter l'utilisateur
    logout() {
        sessionStorage.removeItem('user');
    }
}
