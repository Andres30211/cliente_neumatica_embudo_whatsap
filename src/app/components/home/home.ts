import { Component } from '@angular/core';
import { Topbar } from "../topbar/topbar";
import { Sidebar } from "../sidebar/sidebar";

@Component({
  selector: 'app-home',
  imports: [Topbar, Sidebar],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

}
