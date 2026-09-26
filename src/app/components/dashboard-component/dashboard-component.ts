import {
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';

import {
  ChartConfiguration,
  ChartData
} from 'chart.js';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';

import { DashboardService } from '../../services/DashboardService';

import { DashboardSummary } from '../../interfaces/DashboardSummary';

import { DailyMessageActivity } from '../../interfaces/DailyMessageActivity';

import { DailyContactActivity } from '../../interfaces/DailyContactActivity';


@Component({
  selector: 'app-dashboard-component',

  imports: [
    CommonModule,
    FormsModule,
    BaseChartDirective
  ],

  templateUrl: './dashboard-component.html',

  styleUrl: './dashboard-component.css',
})
export class DashboardComponent implements OnInit {


  // =========================================================
  // DASHBOARD DATA
  // =========================================================

  summary: DashboardSummary | null = null;


  // =========================================================
  // STATE
  // =========================================================

  loading = false;

  error = false;


  // =========================================================
  // DATE FILTER
  // =========================================================

  from = '';

  to = '';


  // =========================================================
  // MESSAGE ACTIVITY CHART
  // =========================================================

  messageChartData: ChartData<'line'> = {

    labels: [],

    datasets: [

      {
        label: 'Recibidos',

        data: [],

        tension: 0.35,

        fill: false
      },

      {
        label: 'Enviados',

        data: [],

        tension: 0.35,

        fill: false
      }

    ]

  };


  messageChartOptions:
    ChartConfiguration<'line'>['options'] = {

      responsive: true,

      maintainAspectRatio: false,

      interaction: {

        mode: 'index',

        intersect: false

      },

      plugins: {

        legend: {

          display: true,

          position: 'top'

        }

      },

      scales: {

        x: {

          grid: {

            display: false

          }

        },

        y: {

          beginAtZero: true,

          ticks: {

            precision: 0

          }

        }

      }

    };


  // =========================================================
  // CONVERSATION STATUS CHART
  // =========================================================

  conversationChartData: ChartData<'doughnut'> = {

    labels: [

      'Bot',

      'Atención humana',

      'Cerradas'

    ],

    datasets: [

      {

        data: []

      }

    ]

  };


  conversationChartOptions:
    ChartConfiguration<'doughnut'>['options'] = {

      responsive: true,

      maintainAspectRatio: false,

      cutout: '72%',

      plugins: {

        legend: {

          display: false

        },

        tooltip: {

          enabled: true

        }

      }

    };


  // =========================================================
  // NEW CONTACTS CHART
  // =========================================================

  contactChartData: ChartData<'bar'> = {

    labels: [],

    datasets: [

      {

        label: 'Nuevos contactos',

        data: []

      }

    ]

  };


  contactChartOptions:
    ChartConfiguration<'bar'>['options'] = {

      responsive: true,

      maintainAspectRatio: false,

      interaction: {

        mode: 'index',

        intersect: false

      },

      plugins: {

        legend: {

          display: false

        },

        tooltip: {

          enabled: true

        }

      },

      scales: {

        x: {

          grid: {

            display: false

          }

        },

        y: {

          beginAtZero: true,

          ticks: {

            precision: 0

          }

        }

      }

    };


  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(

    private readonly dashboardService: DashboardService,

    private readonly dc: ChangeDetectorRef

  ) {}


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    this.initializePeriod();

    this.loadDashboard();

  }


  // =========================================================
  // INITIAL PERIOD
  // =========================================================

  private initializePeriod(): void {

    const today =
      new Date();


    const sevenDaysAgo =
      new Date();


    sevenDaysAgo.setDate(

      today.getDate() - 6

    );


    this.from =
      this.formatDate(
        sevenDaysAgo
      );


    this.to =
      this.formatDate(
        today
      );

  }


  // =========================================================
  // LOAD DASHBOARD
  // =========================================================

  loadDashboard(): void {


    // -------------------------------------------------------
    // VALIDATE DATES
    // -------------------------------------------------------

    if (!this.from || !this.to) {

      this.error = true;

      return;

    }


    if (this.from > this.to) {

      this.error = true;

      return;

    }


    // -------------------------------------------------------
    // LOADING STATE
    // -------------------------------------------------------

    this.loading = true;

    this.error = false;


    // -------------------------------------------------------
    // REQUEST
    // -------------------------------------------------------

    this.dashboardService
      .getSummary(

        this.from,

        this.to

      )
      .subscribe({


        // ===================================================
        // SUCCESS
        // ===================================================

        next: response => {


          console.log(

            'DASHBOARD RESPONSE:',

            response

          );


          // -----------------------------------------------
          // STORE DASHBOARD DATA
          // -----------------------------------------------

          this.summary =
            response;


          // -----------------------------------------------
          // BUILD MESSAGE ACTIVITY CHART
          // -----------------------------------------------

          this.buildMessageChart(

            response.messageActivity ?? []

          );


          // -----------------------------------------------
          // BUILD NEW CONTACTS CHART
          // -----------------------------------------------

          this.buildContactChart(

            response.contactActivity ?? []

          );


          // -----------------------------------------------
          // BUILD CONVERSATION STATUS CHART
          // -----------------------------------------------

          this.buildConversationChart();


          // -----------------------------------------------
          // FINISH LOADING
          // -----------------------------------------------

          this.loading = false;


          // -----------------------------------------------
          // REFRESH VIEW
          // -----------------------------------------------

          this.dc.detectChanges();

        },


        // ===================================================
        // ERROR
        // ===================================================

        error: error => {


          console.error(

            'Error loading dashboard',

            error

          );


          this.error = true;

          this.loading = false;


          this.dc.detectChanges();

        }

      });

  }


  // =========================================================
  // BUILD MESSAGE ACTIVITY CHART
  // =========================================================

  private buildMessageChart(

    activity: DailyMessageActivity[]

  ): void {


    // -------------------------------------------------------
    // LABELS
    // -------------------------------------------------------

    const labels =
      activity.map(item => {


        const [

          ,

          month,

          day

        ] = item.date.split('-');


        return `${day}/${month}`;

      });


    // -------------------------------------------------------
    // RECEIVED MESSAGES
    // -------------------------------------------------------

    const received =
      activity.map(

        item => item.received

      );


    // -------------------------------------------------------
    // SENT MESSAGES
    // -------------------------------------------------------

    const sent =
      activity.map(

        item => item.sent

      );


    // -------------------------------------------------------
    // UPDATE CHART
    // -------------------------------------------------------

    this.messageChartData = {

      labels,

      datasets: [

        {

          label: 'Recibidos',

          data: received,

          tension: 0.35,

          fill: false,

          pointRadius: 4,

          pointHoverRadius: 6

        },

        {

          label: 'Enviados',

          data: sent,

          tension: 0.35,

          fill: false,

          pointRadius: 4,

          pointHoverRadius: 6

        }

      ]

    };

  }


  // =========================================================
  // BUILD NEW CONTACTS CHART
  // =========================================================

  private buildContactChart(

    activity: DailyContactActivity[]

  ): void {


    // -------------------------------------------------------
    // LABELS
    // -------------------------------------------------------

    const labels =
      activity.map(item => {


        const [

          ,

          month,

          day

        ] = item.date.split('-');


        return `${day}/${month}`;

      });


    // -------------------------------------------------------
    // NEW CONTACTS
    // -------------------------------------------------------

    const newContacts =
      activity.map(

        item => item.newContacts

      );


    // -------------------------------------------------------
    // UPDATE CHART
    // -------------------------------------------------------

    this.contactChartData = {

      labels,

      datasets: [

        {

          label: 'Nuevos contactos',

          data: newContacts,

          borderWidth: 0,

          borderRadius: 6,

          maxBarThickness: 42

        }

      ]

    };

  }


  // =========================================================
  // BUILD CONVERSATION STATUS CHART
  // =========================================================

  private buildConversationChart(): void {


    // -------------------------------------------------------
    // VALIDATE DASHBOARD DATA
    // -------------------------------------------------------

    if (!this.summary?.conversations) {


      this.conversationChartData = {

        labels: [

          'Bot',

          'Atención humana',

          'Cerradas'

        ],

        datasets: [

          {

            data: [

              0,

              0,

              0

            ]

          }

        ]

      };


      return;

    }


    // -------------------------------------------------------
    // CONVERSATIONS
    // -------------------------------------------------------

    const conversations =
      this.summary.conversations;


    // -------------------------------------------------------
    // UPDATE CHART
    // -------------------------------------------------------

    this.conversationChartData = {

      labels: [

        'Bot',

        'Atención humana',

        'Cerradas'

      ],

      datasets: [

        {

          data: [

            conversations.botConversations,

            conversations.humanConversations,

            conversations.closedConversations

          ]

        }

      ]

    };

  }


  // =========================================================
  // FORMAT DATE
  // =========================================================

  private formatDate(

    date: Date

  ): string {


    const year =
      date.getFullYear();


    const month =
      String(

        date.getMonth() + 1

      )
        .padStart(

          2,

          '0'

        );


    const day =
      String(

        date.getDate()

      )
        .padStart(

          2,

          '0'

        );


    return `${year}-${month}-${day}`;

  }

}