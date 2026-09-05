import {
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';

import { ServicesWhatsapp } from '../../services/services-whatsapp';
import { UserService } from '../../services/user-service';

import { Contact } from '../../interfaces/Contact';
import { User } from '../../interfaces/User';
import { ContactPage } from '../../interfaces/ContactPage';

@Component({
  selector: 'app-dashboard-component',
  imports: [CommonModule],
  templateUrl: './dashboard-component.html',
  styleUrl: './dashboard-component.css',
})
export class DashboardComponent implements OnInit {
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
    return this.contacts().filter((contact) => {
      return !!contact.email?.trim();
    }).length;
  });

  contactsWithoutEmail = computed(() => {
    return Math.max(
      0,
      this.totalContacts() - this.contactsWithEmail()
    );
  });

  contactsWithCompany = computed(() => {
    return this.contacts().filter((contact) => {
      return !!contact.company?.trim();
    }).length;
  });

  contactsWithoutCompany = computed(() => {
    return Math.max(
      0,
      this.totalContacts() - this.contactsWithCompany()
    );
  });

  // ============================================================
  // PORCENTAJES
  // ============================================================

  emailPercentage = computed(() => {
    const total = this.totalContacts();

    if (total === 0) {
      return 0;
    }

    return Math.round(
      (this.contactsWithEmail() / total) * 100
    );
  });

  companyPercentage = computed(() => {
    const total = this.totalContacts();

    if (total === 0) {
      return 0;
    }

    return Math.round(
      (this.contactsWithCompany() / total) * 100
    );
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

      const interactionDate = new Date(
        contact.lastInteraction
      ).getTime();

      if (Number.isNaN(interactionDate)) {
        return false;
      }

      const difference = now - interactionDate;

      return (
        difference >= 0 &&
        difference <= twentyFourHours
      );
    });
  });

  activeContactsCount = computed(() => {
    return this.activeContacts().length;
  });

  // ============================================================
  // CONTACTOS NUEVOS HOY
  // ============================================================

  newContactsToday = computed(() => {
    const today = new Date();

    return this.contacts().filter((contact) => {
      if (!contact.createdAt) {
        return false;
      }

      const date = new Date(contact.createdAt);

      if (Number.isNaN(date.getTime())) {
        return false;
      }

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
      const step = contact.registrationStep
        ?.toLowerCase()
        ?.trim();

      if (!step) {
        return false;
      }

      return ![
        'completed',
        'complete',
        'finalizado',
        'finalizada',
        'completado',
        'completada',
        'finished',
      ].includes(step);
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
      .filter((contact) => {
        return !!(
          contact.lastInteraction ||
          contact.createdAt
        );
      })
      .sort((a, b) => {
        const dateA = new Date(
          a.lastInteraction || a.createdAt
        ).getTime();

        const dateB = new Date(
          b.lastInteraction || b.createdAt
        ).getTime();

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
    return this.users().filter((user) => {
      return user.enabled === true;
    }).length;
  });

  disabledUsers = computed(() => {
    return this.users().filter((user) => {
      return user.enabled === false;
    }).length;
  });

  // ============================================================
  // NORMALIZACIÓN DE ROLES
  // ============================================================

  private normalizeRole(role: unknown): string {
    return String(role ?? '')
      .trim()
      .toUpperCase()
      .replace(/^ROLE_/, '');
  }

  // ============================================================
  // VENDEDORES
  // ============================================================

  sellers = computed(() => {
    return this.users().filter((user) => {
      return user.roles?.some((role) => {
        const normalizedRole = this.normalizeRole(role);

        return (
          normalizedRole === 'VENDEDOR' ||
          normalizedRole === 'SELLER'
        );
      });
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
      return user.roles?.some((role) => {
        const normalizedRole = this.normalizeRole(role);

        return (
          normalizedRole === 'ADMIN' ||
          normalizedRole === 'ADMINISTRADOR' ||
          normalizedRole === 'ADMINISTRATOR'
        );
      });
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
      const step =
        contact.registrationStep?.trim() ||
        'Sin información';

      map.set(
        step,
        (map.get(step) || 0) + 1
      );
    });

    const total = this.totalContacts();

    return Array.from(map.entries())
      .map(([name, count]) => {
        return {
          name,
          count,
          percentage:
            total > 0
              ? Math.round((count / total) * 100)
              : 0,
        };
      })
      .sort((a, b) => b.count - a.count);
  });

  // ============================================================
  // PASO CON MAYOR CANTIDAD
  // ============================================================

  mainRegistrationStep = computed(() => {
    const steps = this.registrationSteps();

    if (!steps.length) {
      return null;
    }

    return steps[0];
  });

  // ============================================================
  // ACTIVIDAD POR DÍA
  // ============================================================

  activityByDay = computed(() => {
    const result: {
      label: string;
      date: string;
      count: number;
    }[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();

      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - i);

      const count = this.contacts().filter((contact) => {
        if (!contact.createdAt) {
          return false;
        }

        const contactDate = new Date(
          contact.createdAt
        );

        if (Number.isNaN(contactDate.getTime())) {
          return false;
        }

        return (
          contactDate.getDate() === date.getDate() &&
          contactDate.getMonth() === date.getMonth() &&
          contactDate.getFullYear() === date.getFullYear()
        );
      }).length;

      result.push({
        label: date
          .toLocaleDateString('es-CO', {
            weekday: 'short',
          })
          .replace('.', ''),

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
    const values = this.activityByDay().map(
      (item) => item.count
    );

    return Math.max(...values, 1);
  });

  // ============================================================
  // PORCENTAJE DE USUARIOS ACTIVOS
  // ============================================================

  enabledUsersPercentage = computed(() => {
    const total = this.totalUsers();

    if (total === 0) {
      return 0;
    }

    return Math.round(
      (this.enabledUsers() / total) * 100
    );
  });

  // ============================================================
  // INICIALIZACIÓN
  // ============================================================

  ngOnInit(): void {
    this.loadDashboard();
  }

  // ============================================================
  // CARGAR TODOS LOS CONTACTOS
  // ============================================================

  private loadAllContacts() {
    return this.whatsappService.getContacts(0);
  }

  // ============================================================
  // CARGAR DASHBOARD
  // ============================================================

  loadDashboard(): void {
    this.loading.set(true);
    this.error.set(null);

    // ----------------------------------------------------------
    // PRIMERA PÁGINA DE CONTACTOS + USUARIOS
    // ----------------------------------------------------------

    forkJoin({
      contactsPage: this.loadAllContacts(),
      users: this.usersService.getUsers(),
    }).subscribe({
      next: ({ contactsPage, users }) => {
        const totalPages = contactsPage.totalPages || 1;

        // ------------------------------------------------------
        // SI SOLO EXISTE UNA PÁGINA
        // ------------------------------------------------------

        if (totalPages <= 1) {
          this.contacts.set(
            contactsPage.content || []
          );

          this.users.set(users || []);

          this.loading.set(false);

          return;
        }

        // ------------------------------------------------------
        // CARGAR LAS PÁGINAS RESTANTES
        // ------------------------------------------------------

        const remainingRequests = [];

        for (let page = 1; page < totalPages; page++) {
          remainingRequests.push(
            this.whatsappService.getContacts(page)
          );
        }

        forkJoin(remainingRequests).subscribe({
          next: (pages: ContactPage[]) => {
            const allContacts: Contact[] = [
              ...(contactsPage.content || []),
              ...pages.flatMap(
                (page) => page.content || []
              ),
            ];

            this.contacts.set(allContacts);
            this.users.set(users || []);

            this.loading.set(false);
          },

          error: (error) => {
            console.error(
              'Error cargando páginas de contactos:',
              error
            );

            this.error.set(
              'No fue posible cargar todos los contactos.'
            );

            this.loading.set(false);
          },
        });
      },

      error: (error) => {
        console.error(
          'Error cargando dashboard:',
          error
        );

        this.error.set(
          'No fue posible cargar la información del dashboard.'
        );

        this.loading.set(false);
      },
    });
  }

  // ============================================================
  // TRACKING
  // ============================================================

  trackContact(
    index: number,
    contact: Contact
  ): string {
    return contact.id;
  }

  trackUser(
    index: number,
    user: User
  ): string {
    return user.id;
  }

  // ============================================================
  // INTERACCIÓN RECIENTE
  // ============================================================

  isRecentInteraction(
    lastInteraction: string | Date | null
  ): boolean {
    if (!lastInteraction) {
      return false;
    }

    const now = Date.now();

    const interactionTime =
      new Date(lastInteraction).getTime();

    if (Number.isNaN(interactionTime)) {
      return false;
    }

    const twentyFourHours =
      24 * 60 * 60 * 1000;

    const difference =
      now - interactionTime;

    return (
      difference >= 0 &&
      difference < twentyFourHours
    );
  }
}