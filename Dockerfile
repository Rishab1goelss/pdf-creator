FROM node:18.13.0

# Install necessary tools and google-chrome-stable
RUN apt-get update && apt-get install -y python make gcc g++ gnupg wget && \
    wget --quiet --output-document=- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/trusted.gpg.d/google-archive.gpg && \
    sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
    apt-get update && \
    apt-get install google-chrome-stable -y --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Create a user with name 'app' and group that will be used to run the app
RUN groupadd -r app && useradd -rm -g app -G audio,video app

WORKDIR /home/app

# Copy package files
COPY package.json package-lock.json /home/app/

# Ensure permissions are set before installation
RUN chown -R app:app /home/app && chmod -R 775 /home/app

# Switch to non-root user before installing dependencies
USER app

# Install dependencies
RUN npm install --frozen-lockfile

# Copy the rest of the application
COPY . /home/app

# Expose the correct port
EXPOSE 5001

# Run the application
CMD ["npm", "start"]
