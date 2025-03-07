import http from "k6/http";
import { sleep, check } from "k6";

// Configuração do teste
export const options = {
  vus: 10, // 10 usuários virtuais
  duration: "30s", // Duração do teste: 30 segundos
  thresholds: {
    http_req_duration: ["p(95)<500"], // 95% das requisições devem completar em menos de 500ms
    http_req_failed: ["rate<0.01"], // Menos de 1% das requisições podem falhar
  },
};

// Configurações globais
const BASE_URL = "http://localhost:3000";
let token = "";
let shareableId = "";

// Teste principal
export default function () {
  const credentials = {
    email: `user_${__VU}@example.com`,
    password: "password123",
  };

  // Etapa 1: Registrar usuário ou fazer login
  const registerRes = http.post(
    `${BASE_URL}/api/auth/register`,
    JSON.stringify(credentials),
    {
      headers: { "Content-Type": "application/json" },
    }
  );

  // Se o usuário já existe, fazer login
  if (registerRes.status !== 201) {
    const loginRes = http.post(
      `${BASE_URL}/api/auth/login`,
      JSON.stringify(credentials),
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    check(loginRes, {
      "login successful": (r) => r.status === 200,
    });

    token = JSON.parse(loginRes.body).token;
  } else {
    check(registerRes, {
      "register successful": (r) => r.status === 201,
    });

    token = JSON.parse(registerRes.body).token;
  }

  // Etapa 2: Criar um texto
  const textData = {
    title: `Test Title ${__VU} - ${Date.now()}`,
    content: `This is a test content for virtual user ${__VU}`,
    published: true,
  };

  const createTextRes = http.post(
    `${BASE_URL}/api/texts`,
    JSON.stringify(textData),
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  check(createTextRes, {
    "text creation successful": (r) => r.status === 201,
  });

  const createdText = JSON.parse(createTextRes.body);
  const textId = createdText.id;
  shareableId = createdText.shareableId;

  // Etapa 3: Obter lista de textos
  const getTextsRes = http.get(`${BASE_URL}/api/texts`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  check(getTextsRes, {
    "get texts successful": (r) => r.status === 200,
  });

  // Etapa 4: Obter um texto específico
  const getTextRes = http.get(`${BASE_URL}/api/texts/${textId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  check(getTextRes, {
    "get text successful": (r) => r.status === 200,
  });

  // Etapa 5: Atualizar o texto
  const updateData = {
    title: `Updated Title ${__VU} - ${Date.now()}`,
  };

  const updateTextRes = http.put(
    `${BASE_URL}/api/texts/${textId}`,
    JSON.stringify(updateData),
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  check(updateTextRes, {
    "update text successful": (r) => r.status === 200,
  });

  // Etapa 6: Acessar o texto compartilhado (simula outros usuários)
  const getSharedTextRes = http.get(`${BASE_URL}/api/share/${shareableId}`);

  check(getSharedTextRes, {
    "get shared text successful": (r) => r.status === 200,
  });

  // Pausa entre iterações
  sleep(1);
}
