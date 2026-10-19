import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir:'./tests/ui', fullyParallel:true, retries:0,
  reporter:[['list'],['html',{open:'never'}]],
  use:{baseURL:'http://127.0.0.1:4173',trace:'retain-on-failure'},
  webServer:{command:'node tests/server.mjs',url:'http://127.0.0.1:4173/auth-teste/',reuseExistingServer:!process.env.CI},
  projects:[{name:'desktop',use:{...devices['Desktop Chrome']}},{name:'android-viewport',use:{...devices['Pixel 7']}}]
});
