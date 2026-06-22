fetch('http://localhost:8000/api/v1/auth/me', {
  headers: {
    'Accept': 'application/json',
    'Authorization': 'Bearer ' + process.env.TOKEN
  }
}).then(res => res.json()).then(console.log);
