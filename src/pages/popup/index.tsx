import React from 'react';
import { createRoot } from 'react-dom/client';
import '@mantine/core/styles.css';
import '@pages/popup/index.css';
import Popup from '@pages/popup/Popup';
import refreshOnUpdate from 'virtual:reload-on-update-in-view';
import { MantineProvider, createTheme } from '@mantine/core';

refreshOnUpdate('pages/popup');
const theme  = createTheme({
  primaryShade: {light: 5, dark: 8},
  primaryColor: 'orange',
  fontFamily: 'Roboto',
  headings: {
    fontFamily: 'Roboto',
  },
  components: { "badge" :{
    
  } },
})

function init() {
  const appContainer = document.querySelector('#app-container');
  if (!appContainer) {
    throw new Error('Can not find #app-container');
  }
  const root = createRoot(appContainer);
  root.render(
    <MantineProvider theme={theme} defaultColorScheme='auto'>
      <Popup />
    </MantineProvider>,
  );
}

init();
