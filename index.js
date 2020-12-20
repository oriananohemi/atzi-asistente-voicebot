const functions = require("firebase-functions");
const { WebhookClient } = require("dialogflow-fulfillment");
const { Card, Suggestion } = require("dialogflow-fulfillment");
const { info, cities, tematics, suggestion, online } = require("./constants");

process.env.DEBUG = "dialogflow:debug"; // enables lib debugging statements

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(
  (request, response) => {
    const agent = new WebhookClient({ request, response });

    function getCity(agent) {
      const agentParameters = agent.parameters.ciudad;
      if (cities.includes(agentParameters)) {
        agent.add(`Me encanta ${agentParameters}, te puedo ayudar a encontrar
        obras de teatro, festivales o eventos en línea.
        ¿A cuál deseas asistir?`);
        suggestion.forEach((tematica) => agent.add(new Suggestion(tematica)));
      } else {
        agent.add(`En los proximos días no hay registros de obras de teatro o festivales pero el próximo evento en línea es ${online.day} a
    	  las ${online.time} y el tema es ${online.topic} `);
      }
    }

    function tematic(agent) {
      const ssml = `<speak>¡Super!.Estas son las funciones que estarán disponible en tu ciudad:
      ${agent.add(
        tematics.forEach((tematic) =>
          agent.add(new Suggestion(tematic).join('<break time="300ms">'))
        )
      )}
      ¿Cuál te interesa?</speak>`;
      let conv = agent.conv();
      conv.ask(ssml);
      agent.add(conv);
    }

    function tematicDeep(agent) {
      agent.add(`<speak>¡Genial!.Estos son los titulos que estaran disponibles los próximos días en tu ciudad:
      ¿Cuál te interesa?</speak>`);
      agent.add(
        tematics.forEach((tematic) => agent.add(new Suggestion(tematic)))
      );
    }

    function detail(agent) {
      agent.add(`Excelente elección. Esta función se realizará en el ${info.place}, el ${info.day}, a
    las ${info.time}. ¿Deseas agendar? `);
    }

    function detailEvent(agent) {
      agent.add(`El sabado 23 de febrero tendremos un taller de pintura en el
    Centro Cultural`);
    }

    function findAnotherTime(agent) {
      agent.add(`¿Deseas que busque en otro horario?`);
    }

    function chooseAmountOfTickets(agent) {
      agent.add(`¿Cuántos boletos deseas?`);
    }

    function register(agent) {
      agent.add(`<speak>Ok!, Solo nos falta un detalle tecnico.
     	  Confirma tus entradas ingresando a tu <sub alias ="gmail">https://www.gmail.com/</sub>
        ¿Te gustaria explorar algo mas?. Solo di: Quiero informacion
        de otro teatro, festival o evento en línea</speak>
        `);
      agent.add(
        new Card({
          title: "Confirmar entradas",
          imageUrl: "https://www.gmail.com/",
          text: "Confirma entradas por gmail",
          buttonText: "Confirmar",
          buttonUrl: "",
        })
      );
      agent.setContext({ name: "register", lifespan: 2, parameters: {} });
    }

    let intentMap = new Map();
    intentMap.set("City", getCity);
    intentMap.set("Event Selection", detail);
    intentMap.set("Event Selection - no", findAnotherTime);
    intentMap.set("Events", tematic);
    intentMap.set("Events - Deep Links", tematicDeep);
    intentMap.set("Seleccion de taller", detailEvent);
    intentMap.set("Seleccion de taller-yes", chooseAmountOfTickets);
    agent.handleRequest(intentMap);
  }
);
