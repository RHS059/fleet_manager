import React from 'react';
import { createRoot } from 'react-dom/client';
import { createRuntime, BASE_CSS } from './template-runtime.js';
import FleetLogic from './FleetLogic.js';
import template from './fleet.template.html?raw';
import './styles.css';

const base = document.createElement('style');
base.textContent = BASE_CSS;
document.head.prepend(base);
const runtime = createRuntime(document);
runtime.markFetched('FleetConsole');
runtime.setRootName('FleetConsole');
runtime.updateHtml('FleetConsole', template);
runtime.registry.get('FleetConsole').Logic = FleetLogic;
const FleetConsole = runtime.getDC('FleetConsole');
createRoot(document.getElementById('root')).render(
  React.createElement(FleetConsole, { startScreen: 'dashboard', fleetName: 'Northrange Logistics' }),
);
