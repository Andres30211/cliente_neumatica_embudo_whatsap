import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RoleName, User } from '../../interfaces/User';
import { UpdateUserRequest, UserService } from '../../services/user-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Topbar } from "../topbar/topbar";
import { Sidebar } from "../sidebar/sidebar";
import { TokensServices } from '../../services/tokens-services';
import { NotificationServices } from '../../services/notification-services';

@Component({
  selector: 'app-user-management',
  imports: [CommonModule, FormsModule, Topbar, Sidebar],
  templateUrl: './user-management.html',
  styleUrl: './user-management.css',
})
export class UserManagement implements OnInit{

  // =====================================================
  // MATH
  // =====================================================

  Math = Math;

  // =====================================================
  // USUARIOS
  // =====================================================

  users: User[] = [];

  filteredUsers: User[] = [];

  paginatedUsers: User[] = [];

  // =====================================================
  // ESTADOS
  // =====================================================

  loading = false;

  saving = false;

  errorMessage = '';

  successMessage = '';


  // =====================================================
  // BÚSQUEDA
  // =====================================================

  searchTerm = '';

  selectedRole: RoleName[] | '' = '';


  // =====================================================
  // PAGINACIÓN
  // =====================================================

  currentPage = 1;

  pageSize = 5;

  totalPages = 0;


  // =====================================================
  // MODALES
  // =====================================================

  showEditModal = false;

  showRoleModal = false;

  showDeleteModal = false;


  // =====================================================
  // USUARIO SELECCIONADO
  // =====================================================

  selectedUser: User | null = null;


  // =====================================================
  // FORMULARIO EDICIÓN
  // =====================================================

  editForm: UpdateUserRequest = {
    name: '',
    email: ''
  };


  // =====================================================
  // ROL
  // =====================================================

  selectedNewRole: RoleName = 'ROLE_USER';


  // =====================================================
  // ROLES DISPONIBLES
  // =====================================================

  roles: RoleName[] = [
    'ROLE_ADMIN', 'ROLE_PUBLICISTA', 'ROLE_VENDEDOR'
  ];


  constructor(private userService: UserService, 
    private dc: ChangeDetectorRef,
    private notificationService: NotificationServices) {}


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {
    this.loadUsers();
    
  }  
  
  // =====================================================
  // CARGAR USUARIOS
  // =====================================================
  
  loadUsers(): void {
    
    this.loading = true;

    this.errorMessage = '';
    
    this.userService.getUsers().subscribe({
      
      next: (users) => {
        
        this.users = users;
        
        this.applyFilters();
        
        this.loading = false;
        console.log(this.users);

        this.dc.detectChanges();

        },

        error: (error) => {

          console.error(
            'Error cargando usuarios:',
            error
          );

          this.errorMessage =
            'No fue posible cargar los usuarios.';

          this.loading = false;

        }

      });

  }


  // =====================================================
  // BÚSQUEDA
  // =====================================================

  onSearch(): void {

    this.currentPage = 1;

    this.applyFilters();

  }


  // =====================================================
  // FILTRO POR ROL
  // =====================================================

  onRoleFilter(): void {

    this.currentPage = 1;

    this.applyFilters();

  }


  // =====================================================
  // APLICAR FILTROS
  // =====================================================

  applyFilters(): void {

    const search =
      this.searchTerm
        .trim()
        .toLowerCase();


    this.filteredUsers = this.users.filter(
      user => {

        const matchesSearch =
          !search ||

          user.name
            .toLowerCase()
            .includes(search) ||

          user.name
            .toLowerCase()
            .includes(search) ||

          user.email
            .toLowerCase()
            .includes(search);


        const matchesRole =
          !this.selectedRole ||

          user.roles === this.selectedRole;


        return (
          matchesSearch &&
          matchesRole
        );

      }
    );


    this.calculatePagination();

  }


  // =====================================================
  // PAGINACIÓN
  // =====================================================

  calculatePagination(): void {

    this.totalPages =
      Math.ceil(
        this.filteredUsers.length /
        this.pageSize
      );


    if (
      this.totalPages > 0 &&
      this.currentPage > this.totalPages
    ) {

      this.currentPage =
        this.totalPages;

    }


    const startIndex =
      (this.currentPage - 1) *
      this.pageSize;


    const endIndex =
      startIndex +
      this.pageSize;


    this.paginatedUsers =
      this.filteredUsers.slice(
        startIndex,
        endIndex
      );

  }


  // =====================================================
  // CAMBIAR PÁGINA
  // =====================================================

  goToPage(page: number): void {

    if (
      page < 1 ||
      page > this.totalPages
    ) {

      return;

    }


    this.currentPage = page;

    this.calculatePagination();

  }


  previousPage(): void {

    this.goToPage(
      this.currentPage - 1
    );

  }


  nextPage(): void {

    this.goToPage(
      this.currentPage + 1
    );

  }


  // =====================================================
  // PÁGINAS DISPONIBLES
  // =====================================================

  get pages(): number[] {

    return Array.from(
      {
        length: this.totalPages
      },
      (_, index) => index + 1
    );

  }


  // =====================================================
  // ABRIR MODAL EDITAR
  // =====================================================

  openEditModal(user: User): void {

    this.selectedUser = user;

    this.editForm = {

      name:
        user.name,

      email:
        user.email

    };


    this.errorMessage = '';

    this.showEditModal = true;

  }


  // =====================================================
  // CERRAR MODAL EDITAR
  // =====================================================

  closeEditModal(): void {

    if (this.saving) {

      return;

    }

    this.showEditModal = false;

    this.selectedUser = null;

  }


  // =====================================================
  // GUARDAR CAMBIOS
  // =====================================================

  updateUser(): void {

    if (!this.selectedUser) {

      return;

    }


    if (
      !this.editForm.name.trim() ||
      !this.editForm.email.trim()
    ) {

      this.errorMessage =
        'El nombre y el email son obligatorios.';

      return;

    }


    this.saving = true;

    this.errorMessage = '';


    this.userService.updateUser(
      this.selectedUser.id,
      this.editForm
    )
    .subscribe({

      next: (updatedUser) => {

        const index =
          this.users.findIndex(
            user =>
              user.id === updatedUser.id
          );


        if (index !== -1) {

          this.users[index] =
            updatedUser;

        }


        this.applyFilters();

        this.showEditModal = false;

        this.selectedUser = null;

        this.saving = false;

        this.notificationService.success('Actualizar usuario', 'Usuario actualizado correctamente.');

      }

    });

  }


  // =====================================================
  // ABRIR MODAL CAMBIAR ROL
  // =====================================================

  openRoleModal(user: User): void {

    this.selectedUser = user;

    this.selectedNewRole = user.roles[0];

    this.errorMessage = '';

    this.showRoleModal = true;

  }


  // =====================================================
  // CERRAR MODAL ROL
  // =====================================================

  closeRoleModal(): void {

    if (this.saving) {

      return;

    }

    this.showRoleModal = false;

    this.selectedUser = null;

  }


  // =====================================================
  // CAMBIAR ROL
  // =====================================================

  changeRole(): void {

    if (!this.selectedUser) {

      return;

    }


    this.saving = true;

    this.errorMessage = '';


    this.userService.changeRole(this.selectedUser.id,this.selectedNewRole).subscribe({

      next: (updatedUser) => {

        const index =
          this.users.findIndex(
            user =>
              user.id === updatedUser.id
          );


        if (index !== -1) {

          this.users[index] =
            updatedUser;

        }


        this.applyFilters();

        this.showRoleModal = false;

        this.selectedUser = null;

        this.saving = false;

        this.notificationService.success('Editar Rol', `El rol de ${updatedUser.name} ha sido editado.`);

      }

    });

  }


  // =====================================================
  // ELIMINAR USUARIO
  // =====================================================

  deleteUser(user: User): void {

  this.notificationService
    .confirm(
      '¿Eliminar usuario?',
      `¿Estás seguro de que deseas eliminar a ${user.name}?`
    )
    .then((result) => {

      // El usuario canceló
      if (!result.isConfirmed) {
        return;
      }

      this.selectedUser = user;
      this.saving = true;
      this.errorMessage = '';

      this.userService.deleteUser(user.id).subscribe({

          next: () => {

            this.users = this.users.filter(
              u => u.id !== user.id
            );

            this.applyFilters();

            this.showDeleteModal = false;
            this.selectedUser = null;
            this.saving = false;

            this.notificationService.confirm(
              'Usuario eliminado',
              'El usuario fue eliminado correctamente.'
            );

            this.loadUsers();
          }

        });
    });
}
  

  // =====================================================
  // OBTENER CLASE DEL ROL
  // =====================================================

  getRoleClass(role: RoleName): string {

    switch (role) {

      case 'ROLE_ADMIN':
        return 'role-admin';

      case 'ROLE_PUBLICISTA':
        return 'role-publicista';

      case 'ROLE_VENDEDOR':
        return 'role-vendedor';
        
      case 'ROLE_USER':
        return 'role-user';

      default:
        return '';

    }

  }


  // =====================================================
  // OBTENER NOMBRE DEL ROL
  // =====================================================

  getRoleLabel(role: RoleName): string {

    switch (role) {

      case 'ROLE_ADMIN':
        return 'Administrador';

      case 'ROLE_PUBLICISTA':
        return 'Publicista';

      case 'ROLE_VENDEDOR':
        return 'vendedor';

      case 'ROLE_USER':
        return 'Usuario';


      default:
        return role;

    }

  }


  // =====================================================
  // OBTENER INICIALES
  // =====================================================

  getInitials(
    fullName: string
  ): string {

    if (!fullName) {

      return '';

    }


    return fullName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(
        name =>
          name.charAt(0).toUpperCase()
      )
      .join('');

  }

}
