import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Identificador del despliegue.
   *
   * Los identificadores de las Server Actions cambian en cada build. Si el
   * navegador tiene una página de un despliegue anterior y llama a una
   * acción, el servidor nuevo ya no la conoce y responde 404. Con esto Next
   * marca sus recursos con el despliegue al que pertenecen y puede detectar
   * el desfase en vez de fallar a ciegas.
   *
   * Netlify define DEPLOY_ID en cada build; en local queda sin valor y no
   * cambia nada.
   */
  deploymentId: process.env.DEPLOY_ID,
};

export default nextConfig;
