"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Container Lifecycle Simulator.
 *
 * A mock Docker CLI. Commands are parsed (never executed), so the learner can
 * practise the real workflow and see how images, containers and layers relate -
 * including what survives when a container is removed.
 */

interface Container {
  name: string;
  image: string;
  running: boolean;
}

const HELP = [
  "docker build -t app .          build an image from the Dockerfile",
  "docker images                  list local images",
  "docker run -d --name app -p 3000:3000 app",
  "docker ps                      list running containers",
  "docker logs app                show container output",
  "docker exec -it app sh         open a shell inside it",
  "docker stop app                stop the container",
  "docker rm app                  remove the container",
  "help / clear",
];

const LAYERS = [
  "FROM node:20-alpine        (pulled, cached)",
  "WORKDIR /app               (cached)",
  "COPY package*.json ./      (cached)",
  "RUN npm ci --omit=dev      (cached, 412 packages)",
  "COPY . .                   (rebuilt: source changed)",
  'CMD ["npm","start"]        (cached)',
];

export function ContainerLifecycleSimulator() {
  const [command, setCommand] = useState("docker build -t app .");
  const [images, setImages] = useState<string[]>([]);
  const [container, setContainer] = useState<Container | null>(null);
  const [output, setOutput] = useState<string[]>([
    "Mock Docker CLI. Type 'help' to see the supported commands.",
  ]);

  const emit = (lines: string[]) => setOutput((previous) => [...previous, ...lines]);

  const run = (raw: string) => {
    const input = raw.trim().replace(/\s+/g, " ");
    if (!input) return;
    emit([`$ ${input}`]);

    if (input === "help") {
      emit(HELP);
      return;
    }
    if (input === "clear") {
      setOutput([]);
      return;
    }

    const buildMatch = input.match(/^docker build -t ([\w.\-/]+) \.?$/);
    if (buildMatch) {
      const tag = buildMatch[1];
      if (images.includes(tag)) {
        emit(["Using cache for 5 of 6 layers", `Successfully tagged ${tag}:latest`]);
      } else {
        setImages((previous) => [...previous, tag]);
        emit([...LAYERS, `Successfully tagged ${tag}:latest`]);
      }
      return;
    }

    if (input === "docker images") {
      emit(
        images.length === 0
          ? ["REPOSITORY  TAG  IMAGE ID  SIZE   (no images yet)"]
          : [
              "REPOSITORY   TAG     IMAGE ID   SIZE",
              ...images.map((tag) => `${tag.padEnd(12)} latest  9f2a1c     412MB`),
            ],
      );
      return;
    }

    const runMatch = input.match(
      /^docker run (-d )?(--name ([\w-]+) )?(-p (\d+):(\d+) )?([\w.\-/]+)$/,
    );
    if (runMatch) {
      const name = runMatch[3] ?? "app";
      const image = runMatch[7];
      if (!images.includes(image)) {
        emit([
          `Unable to find image '${image}:latest' locally`,
          `docker: Error: pull access denied for ${image}.`,
        ]);
        return;
      }
      setContainer({ name, image, running: true });
      emit([
        `port ${runMatch[5] ?? "3000"} -> ${runMatch[6] ?? "3000"}`,
        `starting container ${name} in the background`,
        "server listening on http://localhost:3000",
      ]);
      return;
    }

    if (input === "docker ps") {
      emit(
        container?.running
          ? [
              "CONTAINER ID  IMAGE  STATUS         PORTS                    NAMES",
              `${container.name}f3b1     ${container.image}  Up 12 seconds  0.0.0.0:3000->3000/tcp  ${container.name}`,
            ]
          : ["CONTAINER ID  IMAGE  STATUS  PORTS  NAMES   (nothing running)"],
      );
      return;
    }

    if (input.startsWith("docker logs")) {
      if (!container) {
        emit(["docker: Error: No such container."]);
        return;
      }
      emit(["GET /health 200 3ms", "GET / 200 18ms", "cache warmed: 0 hits, 0 misses"]);
      return;
    }

    if (input.startsWith("docker exec")) {
      if (!container?.running) {
        emit(["docker: Error: Container is not running."]);
        return;
      }
      emit([
        "# you are now inside the container",
        "ls /app  ->  package.json  src  node_modules",
        "echo $NODE_ENV  ->  production",
      ]);
      return;
    }

    if (input.startsWith("docker stop")) {
      if (!container?.running) {
        emit(["docker: Error: Container is not running."]);
        return;
      }
      setContainer({ ...container, running: false });
      emit([container.name]);
      return;
    }

    if (input.startsWith("docker rm")) {
      if (!container) {
        emit(["docker: Error: No such container."]);
        return;
      }
      emit([
        container.name,
        "# the writable layer is gone: anything written inside the container is deleted",
      ]);
      setContainer(null);
      return;
    }

    if (input.startsWith("docker rmi")) {
      const tag = input.split(/\s+/)[2];
      if (!tag || !images.includes(tag)) {
        emit(["docker: Error: No such image."]);
        return;
      }
      if (container?.image === tag) {
        emit(["docker: Error: conflict: unable to remove repository reference (must force)"]);
        return;
      }
      setImages((previous) => previous.filter((item) => item !== tag));
      emit([`Untagged: ${tag}:latest`]);
      return;
    }

    emit([`docker: '${input}' is not a supported command in this simulator. Type 'help'.`]);

  };

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="chip">{images.length} image(s)</span>
        <span className="chip">
          {container
            ? `${container.name}: ${container.running ? "running" : "stopped"}`
            : "no container"}
        </span>
        <button
          type="button"
          className="btn btn-ghost btn-sm ml-auto"
          onClick={() => {
            setImages([]);
            setContainer(null);
            setOutput(["Mock Docker CLI reset."]);
          }}
        >
          ↺ Reset
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {[
          "docker build -t app .",
          "docker run -d --name app -p 3000:3000 app",
          "docker ps",
          "docker exec -it app sh",
          "docker stop app",
          "docker rm app",
          "help",
        ].map((quick) => (
          <button
            key={quick}
            type="button"
            className="btn btn-secondary btn-sm font-mono text-[11px]"
            onClick={() => run(quick)}
          >
            {quick}
          </button>
        ))}
      </div>

      <form
        className="mt-3 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          run(command);
          setCommand("");
        }}
      >
        <input
          className="input font-mono text-[13px]"
          value={command}
          onChange={(event) => setCommand(event.target.value)}
          placeholder="docker ..."
          aria-label="Docker command"
        />
        <button type="submit" className="btn btn-primary btn-sm">
          Run
        </button>
      </form>

      <div className="mt-4 max-h-64 overflow-y-auto rounded-xl border border-white/10 bg-black/40 p-3 font-mono text-[12px] leading-6 text-slate-300">
        {output.map((line, index) => (
          <p
            key={`${index}-${line.slice(0, 10)}`}
            className={cn(line.startsWith("$") && "text-emerald-200")}
          >
            {line}
          </p>
        ))}
      </div>

      <p className="mt-3 text-[13px] text-slate-400">
        Try writing something inside a container, removing the container, then rebuilding the image:
        the image is unchanged, because images are immutable templates.
      </p>

    </div>
  );
}
