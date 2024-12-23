# Full Cycle 3.0 → Docker → Desafio Node.js

Este repositório apresenta a solução para o desafio do curso **Full Cycle 3.0**, que consiste em criar uma aplicação Node.js integrada com o Nginx configurado como proxy reverso. A aplicação se conecta a um banco de dados MySQL para consultar e exibir os dados armazenados. Todos os serviços são executados por meio do Docker Compose, garantindo uma configuração simples e eficiente.

---

## 📝 Descrição do Desafio

1. Criar uma aplicação em **Node.js** que, ao ser acessada, exiba a seguinte mensagem no navegador:

```html
<h1>Full Cycle Rocks!</h1>
<ul>
  **lista de nomes cadastrados no banco**
</ul>
```

2. Configurar o Nginx como proxy reverso para servir a aplicação Node.js.

A aplicação deve estar disponível na porta 8080 da máquina local.

3. Utilizar um banco de dados MySQL para armazenar os dados, com a tabela people para registrar os nomes.

4. Criar um ambiente completo com Docker Compose, onde todos os serviços (Node.js, Nginx, e MySQL) sejam configurados para funcionar automaticamente após a execução do comando.

5. Garantir que a aplicação esteja acessível na porta 8080 e que o ambiente de desenvolvimento da aplicação utilize volumes.

O uso de volumes é imprescindível para garantir a persistência dos dados no banco, mesmo após o container ser interrompido.

## Solução do Desafio

### Criação do banco de dados MySQL

1. Criar um container executando a imagem do MySQL utilizando Docker Compose para simplificar o processo.

```yaml
db:
  container_name: db
  image: mysql:5.7
  platform: linux/amd64
  command: --innodb-use-native-aio=0
  restart: always
  ports:
    - "3306:3306"
  environment:
    MYSQL_ROOT_PASSWORD: root
    MYSQL_DATABASE: db
```

Observações:

- A plataforma da imagem foi definida manualmente para evitar problemas de compatibilidade com a arquitetura dos processadores Apple M1/M2.
- A porta padrão do MySQL (3306) foi exposta para que a conexão pudesse ser testada na máquina local usando a extensão MySQL Shell for VS Code.

2. Adicionar um volume (bind mount) no serviço do MySQL para persistir os dados do banco localmente.

```yaml
volumes:
  - ./mysql:/var/lib/mysql
```

3. Implementar uma verificação de saúde (health check) para validar a execução do banco antes de subir a aplicação Node.js.

```yaml
healthcheck:
  test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-proot"]
  interval: 10s
  retries: 5
  start_period: 30s
  timeout: 10s
```

4. Criar a tabela "people" no banco de dados.

```sql
use db;

create table people (
  id int not null auto_increment,
  name varchar(255) not null,

  primary key (id)
);
```

Observação:

> Você pode utilizar a extensão MySQL Shell for VS Code para criar um notebook de comandos SQL e efetuar várias operações e testes diretamente no bacno de dados.

### Criação da aplicação Node.js

1. Criar a pasta do projeto e criar uma aplicação Node.js.

```bash
mkdir node
cd node
npm init -y
```

2. Instalar as dependências.
   `express`: micro-framework para a criação de um servidor HTTP.
   `mysql`: driver do banco de dados.

```bash
npm i express
npm i mysql
```

3. Implementar as funcionalidades.

- Criação do servidor HTTP.
- Conexão com o banco de dados MySQL.
- Criação da rota "/" para a apresentação do resultado do desafio.
- Criação da rota POST "/people" para a criação de novos registros no banco de dados, facilitando os testes e a visualização dos resultados.

4. Criação do serviço para a aplicação Node.js.

```yaml
app:
  container_name: app
  build:
    context: node
  ports:
    - "3000:3000"
  depends_on:
    db:
      condition: service_healthy
  volumes:
    - ./node:/app
  networks:
    - node-network
```

### Proxy Reverso

1. Criação da imagem do Nginx.

```dockerfile
FROM nginx:latest

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d

ENTRYPOINT [ "/docker-entrypoint.sh" ]

CMD [ "nginx", "-g", "daemon off;" ]
```

nginx.conf

```
server {
  listen 80;

  location / {
    proxy_pass http://app:3000;
  }
}
```

2. Criação do serviço do Nginx.

```yaml
nginx:
  container_name: nginx
  build:
    context: nginx
  ports:
    - "8080:80"
  depends_on:
    - app
  networks:
    - node-network
```

### 🚀 Como Executar

1. Execute todos os serviços de uma vez utilizando o Docker Compose:

```bash
docker compose up -d --build
```

2. Verifique se o banco de dados está em execução e se a tabela foi criada corretamente.

3. Testar a rota de criação de pessoas.

```bash
curl -X POST http://localhost:8080/people -H "Content-Type: application/json" -d '{"name": "João"}'
```

4. Abra o seu navegador em http://localhost:8080 e você deverá ver o texto "Full Cycle Rocks!", seguido dos nomes de todas as pessoas que você criou no banco de dados.

### 🛠️ Tecnologias Utilizadas

- Node.js: Linguagem utilizada para a criação da aplicação.
- Docker: Plataforma utilizada para a construção e execução de containers.
- Docker Compose: Tecnologia utilizada para executar todos os serviços simultaneamente, além de permitir a centralização dos comandos de execução em um único arquivo.
- Nginx: Proxy reverso utilizado para servir a aplicação Node.js.
- MySQL: Banco de dados da aplicação.

### 📂 Estrutura do Projeto

- mysql: Diretório destinado ao volume para persistência dos dados do banco MySQL, garantindo que as informações sejam mantidas mesmo após a interrupção do container.
- nginx: Diretório que contém a imagem personalizada do Nginx, incluindo o arquivo de configuração utilizado para configurar o proxy reverso.
- node: Diretório onde está o código-fonte da aplicação Node.js, junto com o Dockerfile necessário para sua construção e execução.
- docker-compose.yaml: Arquivo principal de configuração do Docker Compose, responsável por orquestrar a criação e execução de todos os serviços do projeto.

### 📖 Aprendizados

- Implementação e gerenciamento de múltiplos containers interconectados em uma rede virtual utilizando o Docker Compose.
- Configuração de comunicação entre uma aplicação Node.js e um banco de dados MySQL em containers distintos.
- Desenvolvimento e implementação de um proxy reverso funcional com o Nginx para servir a aplicação de forma eficiente e segura.

### 🏆 Desafio Concluído!

Este projeto exemplifica de forma prática como integrar e executar vários containers no Docker de maneira simultânea, garantindo a comunicação entre eles por meio de redes. Além disso, demonstra o uso do Nginx como proxy reverso para expor a aplicação de forma centralizada e acessível.
