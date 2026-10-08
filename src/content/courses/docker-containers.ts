import type { Course } from "@/types";

export const dockerContainers: Course = {
  id: "docker-containers",
  slug: "docker-containers",
  title: "Docker & Containers, Explained",
  subtitle: "'It works on my machine' - solved once and for all.",
  description:
    "Containers package your app with everything it needs to run, so the same image behaves the same everywhere. Learn the image versus container distinction, drive the lifecycle from the command line, and write a Dockerfile you would be happy to ship.",
  icon: "🐳",
  accent: "from-blue-500 to-sky-400",
  category: "engineering",
  tags: ["docker", "containers", "devops", "deployment", "environments"],
  level: "beginner",
  audience: ["cs", "non-cs"],
  estimatedMinutes: 50,
  outcomes: [
    "Explain the difference between an image and a container",
    "Drive the container lifecycle from the command line",
    "Write a Dockerfile with a small, cached build",
  ],
  origin: "curated",
  modules: [
    {
      id: "docker-m1",
      title: "Containers without the mystery",
      summary: "Images, running containers, and shipping the result.",
      lessons: [
        {
          id: "images-and-containers",
          title: "Images, containers and why they matter",
          minutes: 15,
          objectives: [
            "Describe an image as a recipe and a container as a running instance",
            "Explain why the same image behaves the same everywhere",
          ],
          blocks: [
            {
              kind: "text",
              heading: "Recipe and cake",
              body: [
                "An image is a frozen, layered filesystem plus the command to run: the recipe. A container is a running instance of that image: the cake. You can start many containers from one image, and they cannot see each other's changes.",
                "The layers matter for speed. Docker caches each instruction, so rebuilding after a code change only redoes the layers that changed - as long as you order the Dockerfile sensibly.",
              ],
            },
            {
              kind: "callout",
              tone: "info",
              title: "Why this removes a whole class of bugs",
              body: "The container carries its own runtime, libraries and environment variables. A missing dependency or a different Python version stops being 'works on my machine' and becomes a build error you see immediately.",
            },
            {
              kind: "quiz",
              question: "What is the relationship between an image and a container?",
              options: [
                "An image is a packaged template; a container is a running instance of it",
                "A container is a template; an image is a running instance of it",
                "They are two names for the same thing",
                "An image runs in the cloud; a container only runs locally",
              ],
              answerIndex: 0,
              explanation:
                "One image, many containers. Deleting a container never changes the image, which is why containers are safe to throw away.",
            },
          ],
        },
        {
          id: "container-lifecycle",
          title: "The container lifecycle",
          minutes: 18,
          objectives: [
            "Run, inspect and stop a container",
            "Explain why containers are disposable",
          ],
          blocks: [
            {
              kind: "simulation",
              simulationId: "container-lifecycle",
              title: "Container Lifecycle Simulator",
              description:
                "Drive a mock Docker CLI: build an image, run a container, exec into it, then stop and clean up. Watch the image layers appear as you go.",
            },
            {
              kind: "text",
              heading: "The five commands that cover most days",
              body: [
                "Build, run, ps, logs and stop. Add exec when you need a shell inside a running container, and rm to clean up. Notice that stopping a container keeps it around; removing it deletes its writable layer, which is why data belongs in a volume.",
              ],
            },
            {
              kind: "code",
              language: "bash",
              caption: "The lifecycle in six lines",
              code: `docker build -t skillforge:1.0 .     # image from the Dockerfile
docker run -d --name app -p 3000:3000 skillforge:1.0
docker ps                            # is it running?
docker logs app                      # what did it print?
docker exec -it app sh               # poke around inside
docker stop app && docker rm app     # stop, then remove`,
            },
            {
              kind: "quiz",
              question:
                "You write a file inside a running container, then remove the container. What happens to the file?",
              options: [
                "It is gone: the writable layer is deleted with the container",
                "It is saved back into the image automatically",
                "It is stored on the host filesystem by default",
                "It survives and appears in the next container",
              ],
              answerIndex: 0,
              explanation:
                "Containers are disposable. Anything that must survive belongs in a volume or a mounted directory - not in the container's writable layer.",
            },
          ],
        },
        {
          id: "dockerfile-and-compose",
          title: "Ship it: Dockerfiles and compose",
          minutes: 20,
          objectives: [
            "Write a Dockerfile that caches dependencies",
            "Describe when a multi-container setup needs compose",
          ],
          blocks: [
            {
              kind: "text",
              heading: "Order matters for build speed",
              body: [
                "Copy the dependency manifest and install first, then copy your source. Dependency layers change rarely, so Docker reuses them on every code change. Copy everything at the start and every build reinstalls the world.",
              ],
            },
            {
              kind: "code",
              language: "dockerfile",
              caption: "A Dockerfile for a Node app, ordered for caching",
              code: `FROM node:20-alpine
WORKDIR /app

# 1. Dependencies first: this layer is cached until package.json changes
COPY package*.json ./
RUN npm ci --omit=dev

# 2. Source last: changes often, invalidates only the cheap layers
COPY . .

ENV NODE_ENV=production
EXPOSE 3000
USER node
CMD ["npm", "start"]`,
            },
            {
              kind: "checklist",
              title: "Before you push an image",
              items: [
                "A .dockerignore excludes node_modules, .git and .env files",
                "Base image is pinned to a specific tag, not :latest",
                "The container runs as a non-root user",
                "No secrets baked into layers - pass them as environment variables",
                "Health check defined so the platform can restart a stuck container",
              ],
            },
            {
              kind: "callout",
              tone: "tip",
              title: "When you need more than one container",
              body: "As soon as the app needs a database, a cache or a background worker, use docker compose so the whole stack starts with one command and shares a network.",
            },
            {
              kind: "quiz",
              question: "Why copy package.json and install before copying the source code?",
              options: [
                "So the dependency layer stays cached when only the source changes",
                "Because Docker cannot read source files before dependencies",
                "To make the final image smaller",
                "Because npm ci fails if the source exists",
              ],
              answerIndex: 0,
              explanation:
                "Layer caching keys on the instruction and its inputs. Keeping dependencies in an early, rarely-changing layer makes rebuilds seconds instead of minutes.",
            },
          ],
        },
      ],
    },
  ],
};
