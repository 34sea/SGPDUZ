import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api"
  // baseURL: "http://72.62.251.62:8000"
});


// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token-dashboard-SGPD"); 
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

api.interceptors.request.use((config) => {
    try {
        const data = localStorage.getItem(
            "user-dashboard-SGPD"
        );

        if (data) {
            const userData = JSON.parse(data);

            const token = userData?.token;

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }

    } catch (error) {
        console.error(
            "Erro ao obter token de autenticação:",
            error
        );
    }

    return config;
});

// export default api;



export default api;
