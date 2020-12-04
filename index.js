const functions = require("firebase-functions");
const { WebhookClient } = require("dialogflow-fulfillment");
const { Card, Suggestion } = require("dialogflow-fulfillment");

process.env.DEBUG = "dialogflow:debug"; // enables lib debugging statements

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(
  (request, response) => {
    const cities = ["Bogotá", "Ciudad de México", "bogota"];
    const tematicas = [
      "Dibujo artistico",
      "Dibujo de caricaturas",
      "Dibujo para niños",
    ];
    const events = {
      day: "22 de noviembre de 2021",
      time: "7 pm",
      topic: "Taller de pintura",
    };

    const sugerencia = ["Platicas", "Talleres", "Live"];

    const agent = new WebhookClient({ request, response });
    console.log(
      "Dialogflow Request headers: " + JSON.stringify(request.headers)
    );
    console.log("Dialogflow Request body: " + JSON.stringify(request.body));

    function getCity(agent) {
      if (cities.includes(agent.parameters.ciudad)) {
        agent.add(`Genial, te puedo ayudar a encontrar
      		talleres en tu ciudad o eventos en linea.
            Por cual te gustaria empezar?
            `);
        sugerencia.forEach((tematica) => agent.add(new Suggestion(tematica)));
      } else {
        agent.add(`El proximo evento en linea es ${events.day} a 
    	las ${events.time} y el tema es ${events.topic} `);
      }
    }

    function tematic(agent) {
      const ssml = `<speak>Super!. A mi también me encantan los retos,
      estos son los temas que se van a crubir próximamente en tu ciudad:
      ¿Cual te interesa mas?</speak>`;
      let conv = agent.conv();
      conv.ask(ssml);
      agent.add(conv);
      agent.add(
        tematicas.forEach((tematica) =>
          agent.add(new Suggestion(tematica).join('<break time="300ms">'))
        )
      );
    }

    function tematicDeep(agent) {
      agent.add(`Super!. A mi tambien me encantan los retos,
    estos son los temas que se van a crubir proximamente en tu ciudad:
    ${tematicas.join(",")}
    ¿Cual te interesa mas?
    `);
      agent.add(
        tematicas.forEach((tematica) => agent.add(new Suggestion(tematica)))
      );
    }

    function detail(agent) {
      agent.add(`El proximo evento en linea es ${events.day} a 
    	las ${events.time} y el tema es ${events.topic} `);
    }

    function detailEvent(agent) {
      agent.add(`El sabado 23 de febrero tendremos un taller de pintura en el
    Centro Cultural`);
    }

    function register(agent) {
      agent.add(`<speak>Ok!, Solo nos falta un detalle tecnico. 
     	Para asistir debes registrarte en <sub alias ="la plataforma de Meetup">https://www.meetup.com/</sub>
        ¿Te gustaria explorar algo mas?. Solo di: Quiero informacion
        de otro taller, platica o evento</speak>
        `);
      agent.add(
        new Card({
          title: "Registro en Meetup",
          imageUrl: "https://www.meetup.com/",
          text: "Registrate en Meetup",
          buttonText: "Registrarme",
          buttonUrl: "",
        })
      );
      agent.setContext({ name: "register", lifespan: 2, parameters: {} });
    }

    let intentMap = new Map();
    intentMap.set("Obtener Ciudad", getCity);
    intentMap.set("Live", detail);
    intentMap.set("Talleres", tematic);
    intentMap.set("Talleres - Deep Links", tematicDeep);
    intentMap.set("Seleccion de taller", detailEvent);
    intentMap.set("Seleccion de taller-yes", register);
    agent.handleRequest(intentMap);
  }
);
