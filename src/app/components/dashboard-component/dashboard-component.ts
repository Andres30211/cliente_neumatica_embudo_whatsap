import { Component, computed, inject, signal } from '@angular/core';
import { ServicesWhatsapp } from '../../services/services-whatsapp';
import { UserService } from '../../services/user-service';
import { Contact } from '../../interfaces/Contact';
import { User } from '../../interfaces/User';
import { CommonModule } from '@angular/common';
import { ContactPage } from '../../interfaces/ContactPage';

@Component({
  selector: 'app-dashboard-component',
  imports: [CommonModule],
  templateUrl: './dashboard-component.html',
  styleUrl: './dashboard-component.css',
})
export class DashboardComponent {
  private readonly whatsappService = inject(ServicesWhatsapp);
  private readonly usersService = inject(UserService);

  // ============================================================
  // DATA PRINCIPAL
  // ============================================================

  contacts = signal<Contact[]>([]);

  users = signal<User[]>([]);

  loading = signal<boolean>(true);

  error = signal<string | null>(null);

  // ============================================================
  // FECHA ACTUAL
  // ============================================================

  today = new Date();

  // ============================================================
  // CONTACTOS
  // ============================================================

  totalContacts = computed(() => {
    return this.contacts().length;
  });

  contactsWithEmail = computed(() => {
    return this.contacts().filter((contact) => !!contact.email?.trim()).length;
  });

  contactsWithoutEmail = computed(() => {
    return this.totalContacts() - this.contactsWithEmail();
  });

  contactsWithCompany = computed(() => {
    return this.contacts().filter((contact) => !!contact.company?.trim()).length;
  });

  contactsWithoutCompany = computed(() => {
    return this.totalContacts() - this.contactsWithCompany();
  });

  // ============================================================
  // PORCENTAJES
  // ============================================================

  emailPercentage = computed(() => {
    if (this.totalContacts() === 0) {
      return 0;
    }

    return Math.round((this.contactsWithEmail() / this.totalContacts()) * 100);
  });

  companyPercentage = computed(() => {
    if (this.totalContacts() === 0) {
      return 0;
    }

    return Math.round((this.contactsWithCompany() / this.totalContacts()) * 100);
  });

  // ============================================================
  // CONTACTOS ACTIVOS
  // ============================================================

  activeContacts = computed(() => {
    const now = Date.now();

    const twentyFourHours = 24 * 60 * 60 * 1000;

    return this.contacts().filter((contact) => {
      if (!contact.lastInteraction) {
        return false;
      }

      const interactionDate = new Date(contact.lastInteraction).getTime();

      return now - interactionDate <= twentyFourHours;
    });
  });

  activeContactsCount = computed(() => {
    return this.activeContacts().length;
  });

  // ============================================================
  // CONTACTOS NUEVOS
  // ============================================================

  newContactsToday = computed(() => {
    const today = new Date();

    return this.contacts().filter((contact) => {
      if (!contact.createdAt) {
        return false;
      }

      const date = new Date(contact.createdAt);

      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    }).length;
  });

  // ============================================================
  // REGISTROS INCOMPLETOS
  // ============================================================

  incompleteContacts = computed(() => {
    return this.contacts().filter((contact) => {
      const step = contact.registrationStep?.toLowerCase()?.trim();

      return (
        step && !['completed', 'complete', 'finalizado', 'completado', 'finished'].includes(step)
      );
    });
  });

  incompleteContactsCount = computed(() => {
    return this.incompleteContacts().length;
  });

  // ============================================================
  // CONTACTOS RECIENTES
  // ============================================================

  recentContacts = computed(() => {
    return [...this.contacts()]
      .sort((a, b) => {
        const dateA = new Date(a.lastInteraction || a.createdAt).getTime();

        const dateB = new Date(b.lastInteraction || b.createdAt).getTime();

        return dateB - dateA;
      })
      .slice(0, 6);
  });

  // ============================================================
  // USUARIOS
  // ============================================================

  totalUsers = computed(() => {
    return this.users().length;
  });

  enabledUsers = computed(() => {
    return this.users().filter((user) => user.enabled).length;
  });

  disabledUsers = computed(() => {
    return this.users().filter((user) => !user.enabled).length;
  });

  // ============================================================
  // VENDEDORES
  // ============================================================

  sellers = computed(() => {
    return this.users().filter((user) => {
      return user.roles?.some((role) => String(role).toUpperCase() === 'VENDEDOR');
    });
  });

  sellerCount = computed(() => {
    return this.sellers().length;
  });

  // ============================================================
  // ADMINISTRADORES
  // ============================================================

  administrators = computed(() => {
    return this.users().filter((user) => {
      return user.roles?.some(
        (role) =>
          String(role).toUpperCase() === 'ADMIN' ||
          String(role).toUpperCase() === 'ADMINISTRADOR' ||
          String(role).toUpperCase() === 'ADMINISTRATOR',
      );
    });
  });

  administratorCount = computed(() => {
    return this.administrators().length;
  });

  // ============================================================
  // DISTRIBUCIÓN DE REGISTROS
  // ============================================================

  registrationSteps = computed(() => {
    const map = new Map<string, number>();

    this.contacts().forEach((contact) => {
      const step = contact.registrationStep?.trim() || 'Sin información';

      map.set(step, (map.get(step) || 0) + 1);
    });

    const total = this.totalContacts();

    return Array.from(map.entries())
      .map(([name, count]) => {
        return {
          name,
          count,
          percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        };
      })
      .sort((a, b) => b.count - a.count);
  });

  // ============================================================
  // PASO CON MAYOR CANTIDAD DE CONTACTOS
  // ============================================================

  mainRegistrationStep = computed(() => {
    const steps = this.registrationSteps();

    if (!steps.length) {
      return null;
    }

    return steps[0];
  });

  // ============================================================
  // MÉTRICAS DE ACTIVIDAD
  // ============================================================

  activityByDay = computed(() => {
    const result = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();

      date.setDate(date.getDate() - i);

      const count = this.contacts().filter((contact) => {
        if (!contact.createdAt) {
          return false;
        }

        const contactDate = new Date(contact.createdAt);

        return (
          contactDate.getDate() === date.getDate() &&
          contactDate.getMonth() === date.getMonth() &&
          contactDate.getFullYear() === date.getFullYear()
        );
      }).length;

      result.push({
        label: date.toLocaleDateString('es-CO', { weekday: 'short' }).replace('.', ''),

        date: date.toLocaleDateString('es-CO', {
          day: 'numeric',
          month: 'short',
        }),

        count,
      });
    }

    return result;
  });

  maxActivity = computed(() => {
    const values = this.activityByDay().map((item) => item.count);

    return Math.max(...values, 1);
  });

  // ============================================================
  // PORCENTAJE DE USUARIOS ACTIVOS
  // ============================================================

  enabledUsersPercentage = computed(() => {
    if (!this.totalUsers()) {
      return 0;
    }

    return Math.round((this.enabledUsers() / this.totalUsers()) * 100);
  });

  // ============================================================
  // CARGA INICIAL
  // ============================================================

  ngOnInit(): void {
    this.loadDashboard();
  }

  // ============================================================
  // CARGAR DASHBOARD
  // ============================================================

  loadDashboard(): void {
    this.loading.set(true);

    this.error.set(null);

    // ----------------------------------------------------------
    // CONTACTOS
    // ----------------------------------------------------------

    this.whatsappService.getContacts().subscribe({
      next: (response: ContactPage) => {
        this.contacts.set(response.content || []);
      },

      error: (error) => {
        console.error('Error cargando contactos:', error);
        this.error.set('No fue posible cargar los contactos.');
      },
    });

    // ----------------------------------------------------------
    // USUARIOS
    // ----------------------------------------------------------

    this.usersService.getUsers().subscribe({
      next: (users: User[]) => {
        this.users.set(users || []);

        this.loading.set(false);
      },

      error: (error) => {
        console.error('Error cargando usuarios:', error);

        this.error.set('No fue posible cargar los usuarios.');

        this.loading.set(false);
      },
    });
  }

  // ============================================================
  // TRACKING
  // ============================================================

  trackContact(index: number, contact: Contact): string {
    return contact.id;
  }

  trackUser(index: number, user: User): string {
    return user.id;
  }

  isRecentInteraction(lastInteraction: string | Date | null): boolean {
  if (!lastInteraction) {
    return false;
  }

  const now = Date.now();
  const interactionTime = new Date(lastInteraction).getTime();
  const twentyFourHours = 24 * 60 * 60 * 1000;

  return (
    interactionTime <= now &&
    now - interactionTime < twentyFourHours
  );
}
}
