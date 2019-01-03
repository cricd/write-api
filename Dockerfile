
############################################################
# Dockerfile to run cricd-write-api
############################################################

FROM node:alpine
MAINTAINER Bradley Scott

# Copy code to container
RUN mkdir cricd-write-api
COPY . /cricd-write-api

# Get dependencies
RUN cd cricd-write-api \
	&& npm install

# Define working directory.
WORKDIR /cricd-write-api

# Start the service
CMD npm start

# Expose ports.
EXPOSE 3001
