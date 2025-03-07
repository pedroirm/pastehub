import http from "k6/http";
import { sleep, check } from "k6";

// Configuração do teste
export const options = {
  vus: 5,
  duration: "30s",
  thresholds: {
    http_req_duration: ["p(95)<500"],
    http_req_failed: ["rate<0.5"],
  },
};

// Configurações globais
const BASE_URL = "http://localhost:3000";
let token = "";
let shareableId = "";

// Teste principal
export default function () {
  const credentials = {
    name: `User ${__VU}`,
    email: `user_${__VU}@example.com`,
    password: "password123",
  };


  const registerRes = http.post(
    `${BASE_URL}/api/auth/register`,
    JSON.stringify(credentials),
    {
      headers: { "Content-Type": "application/json" },
    }
  );


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

  const getTextsRes = http.get(`${BASE_URL}/api/texts`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  check(getTextsRes, {
    "get texts successful": (r) => r.status === 200,
  });


  const getTextRes = http.get(`${BASE_URL}/api/texts/${textId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  check(getTextRes, {
    "get text successful": (r) => r.status === 200,
  });


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


  const getSharedTextRes = http.get(`${BASE_URL}/api/share/${shareableId}`);

  check(getSharedTextRes, {
    "get shared text successful": (r) => r.status === 200,
  });


  sleep(1);
}
