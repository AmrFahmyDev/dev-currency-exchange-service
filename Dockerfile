FROM registry.access.redhat.com/ubi8/ubi:8.3

ENV DEVCICD_HOME=/opt/devcicd

RUN yum install -y nodejs && \ 
    yum clean all

WORKDIR ${DEVCICD_HOME}/app

COPY package.json ${DEVCICD_HOME}/app

RUN npm install

COPY . ${DEVCICD_HOME}/app

RUN groupadd -r devcicd -f -g 1001 \
 && useradd -u 1001 -r -g devcicd -m -d ${DEVCICD_HOME} -s /sbin/nologin \
 -c "Devcicd User" devcicd \
 && chown -R devcicd:devcicd ${DEVCICD_HOME} \
 && chmod -R 755 ${DEVCICD_HOME}

USER devcicd

EXPOSE 3000
CMD ["npm", "start"]
