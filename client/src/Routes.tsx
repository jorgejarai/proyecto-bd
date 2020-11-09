import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Me } from './pages/Me';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Persons } from './pages/Persons';
import { Documents } from './pages/Documents';

export const Routes: React.FC = () => {
  return (
    <BrowserRouter>
      <Header />
      <Switch>
        <Route exact path='/' component={Home} />
        <Route exact path='/register' component={Register} />
        <Route exact path='/login' component={Login} />
        <Route exact path='/me' component={Me} />
        <Route exact path='/persons' component={Persons} />
        <Route exact path='/documents' component={Documents} />
      </Switch>
    </BrowserRouter>
  );
};
