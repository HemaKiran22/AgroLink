import { Routes } from '@angular/router';

import { Landing } from './landing/landing';

import { Login } from './auth/login/login';

import { Register } from './auth/register/register';

import {
  FarmerDashboard
} from './farmer/dashboard/dashboard';

import {
  SellerDashboard
} from './seller/dashboard/dashboard';

import {
  authGuard
} from './guards/auth.guard';

import {
  roleGuard
} from './guards/role.guard';

import {
  Crops
} from './farmer/crops/crops';

import {
  Agrochemicals
} from './farmer/agrochemicals/agrochemicals';

import {
  Requests
} from './farmer/requests/requests';

import {
  FeedbackPage
} from './feedback/feedback';

import {
  SellerAgrochemicals
} from './seller/agrochemicals/agrochemicals';

import {
  SellerRequests
} from './seller/requests/requests';

import {
  SellerCrops
} from './seller/crops/crops';


export const routes: Routes = [

  // ==========================
  // PUBLIC LANDING PAGE
  // ==========================

  {
    path: '',
    component: Landing
  },

  {
  path: 'seller/agrochemicals',

  component: SellerAgrochemicals,

  canActivate: [
    authGuard,
    roleGuard
  ],

  data: {
    role: 'Seller'
  }
},
{
  path: 'seller/requests',

  component: SellerRequests,

  canActivate: [
    authGuard,
    roleGuard
  ],

  data: {
    role: 'Seller'
  }
},


  // ==========================
  // LOGIN
  // ==========================

  {
    path: 'login',
    component: Login
  },


  // ==========================
  // REGISTER
  // ==========================

  {
    path: 'register',
    component: Register
  },
  {
  path: 'seller/crops',

  component: SellerCrops,

  canActivate: [
    authGuard,
    roleGuard
  ],

  data: {
    role: 'Seller'
  }
},


  // ==========================
  // FARMER DASHBOARD
  // ==========================

  {
    path: 'farmer/dashboard',

    component: FarmerDashboard,

    canActivate: [
      authGuard,
      roleGuard
    ],

    data: {
      role: 'Farmer'
    }
  },
  {
  path: 'farmer/agrochemicals',

  component: Agrochemicals,

  canActivate: [
    authGuard,
    roleGuard
  ],

  data: {
    role: 'Farmer'
  }
},


  // ==========================
  // SELLER DASHBOARD
  // ==========================

  {
    path: 'seller/dashboard',

    component: SellerDashboard,

    canActivate: [
      authGuard,
      roleGuard
    ],

    data: {
      role: 'Seller'
    }
  },
  {
  path: 'farmer/crops',

  component: Crops,

  canActivate: [
    authGuard,
    roleGuard
  ],

  data: {
    role: 'Farmer'
  }
},
{
  path: 'farmer/requests',

  component: Requests,

  canActivate: [
    authGuard,
    roleGuard
  ],

  data: {
    role: 'Farmer'
  }
},
{
  path: 'feedback',

  component: FeedbackPage,

  canActivate: [
    authGuard
  ]
},


  // ==========================
  // UNKNOWN ROUTE
  // ==========================

  {
    path: '**',
    redirectTo: ''
  }

];