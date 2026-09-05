import { Component, OnDestroy, OnInit } from '@angular/core';
import { Topbar } from "../topbar/topbar";
import { Sidebar } from "../sidebar/sidebar";
import { DashboardComponent } from "../dashboard-component/dashboard-component";

interface CarouselSlide {
  image: string;
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
}

@Component({
  selector: 'app-home',
  imports: [Topbar, Sidebar, DashboardComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit, OnDestroy{

  slides: CarouselSlide[] = [
    {
      image: 'carrusel/cilindro-1.jpg',
      title: 'CILINDROS NEUMÁTICOS',
      subtitle: 'FUERZA QUE IMPULSA TU INDUSTRIA',
      description: 'Soluciones neumáticas para aplicaciones industriales.',
      buttonText: 'Ver productos'
    },
    {
      image: 'carrusel/cilindro-2.jpg',
      title: 'ACTUADORES NEUMÁTICOS',
      subtitle: 'PRECISIÓN Y RENDIMIENTO',
      description: 'Tecnología diseñada para optimizar tus procesos.',
      buttonText: 'Ver productos'
    },
    {
      image: 'carrusel/cilindro-3.jpg',
      title: 'SOLUCIONES INDUSTRIALES',
      subtitle: 'TECNOLOGÍA PARA TU EMPRESA',
      description: 'Componentes neumáticos para diferentes aplicaciones.',
      buttonText: 'Conocer más'
    },
    {
      image: 'carrusel/cilindro-4.jpg',
      title: 'COMPONENTES NEUMÁTICOS',
      subtitle: 'CALIDAD PARA TU INDUSTRIA',
      description: 'Productos confiables para mejorar tus operaciones.',
      buttonText: 'Ver catálogo'
    }
  ];

  currentIndex = 0;

  private autoPlayInterval?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.startAutoPlay();
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  next(): void {
    this.currentIndex =
      (this.currentIndex + 1) % this.slides.length;

    this.restartAutoPlay();
  }

  previous(): void {
    this.currentIndex =
      (this.currentIndex - 1 + this.slides.length) % this.slides.length;

    this.restartAutoPlay();
  }

  goToSlide(index: number): void {
    this.currentIndex = index;
    this.restartAutoPlay();
  }

  startAutoPlay(): void {
    this.stopAutoPlay();

    this.autoPlayInterval = setInterval(() => {
      this.currentIndex =
        (this.currentIndex + 1) % this.slides.length;
    }, 5000);
  }

  stopAutoPlay(): void {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = undefined;
    }
  }

  restartAutoPlay(): void {
    this.startAutoPlay();
  }

}
