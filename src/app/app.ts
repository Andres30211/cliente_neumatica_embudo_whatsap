import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WhatsappEmbudo } from "./components/whatsapp-embudo/whatsapp-embudo";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, WhatsappEmbudo],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('neumatica_industrial_crm');
}
