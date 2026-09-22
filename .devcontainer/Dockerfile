FROM node:24-bookworm-slim AS node
FROM python:3.14-slim-bookworm

COPY --from=node /usr/local/bin/node /usr/local/bin/node
COPY --from=node /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/npm

RUN ln -s ../lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -s ../lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx \
    && apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl git graphviz sudo \
    && useradd --create-home --shell /bin/bash vscode \
    && printf 'vscode ALL=(root) NOPASSWD:ALL\n' > /etc/sudoers.d/vscode \
    && chmod 0440 /etc/sudoers.d/vscode \
    && python3 -m venv /home/vscode/.venv \
    && chown -R vscode:vscode /home/vscode \
    && rm -rf /var/lib/apt/lists/*

COPY package-lock.json /tmp/docs-package-lock.json
RUN PLAYWRIGHT_VERSION=$(node -p 'require("/tmp/docs-package-lock.json").packages["node_modules/@playwright/test"].version') \
    && npm exec --yes --package="@playwright/test@${PLAYWRIGHT_VERSION}" -- playwright install-deps chromium \
    && npm cache clean --force \
    && rm -f /tmp/docs-package-lock.json \
    && rm -rf /var/lib/apt/lists/*

ENV PATH="/home/vscode/.venv/bin:${PATH}" \
    PIP_DISABLE_PIP_VERSION_CHECK=1
USER vscode