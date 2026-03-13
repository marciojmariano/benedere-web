export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api/v1',
  auth0: {
    domain: 'dev-iy7ngjahohu3syvm.us.auth0.com',
    clientId: 'vNlDyr2DgqDzvYHgE21EhROFQbKocXqz',
    authorizationParams: {
      redirect_uri: window.location.origin,
      audience: 'https://api.benedere.com.br',
    },
  },
};