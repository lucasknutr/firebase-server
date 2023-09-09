// * API Firebase com os filmes listados
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const express = require("express");
const cors = require("cors");


// * APP PRINCIPAL
const app = express();
app.use(cors({origin: true}));

// * Referencia da base de dados principal
const db = admin.firestore();

// * ROUTES

app.get("/", (req, res) => {
  res.json("SUCCESS");
});
// ROUTE PRINCIPAL - LISTA COMPLETA - get()
app.get("/api/getAll", (req, res) => {
  (async () => {
    try {
      const query = db.collection("filmes");
      const resposta = [];

      await query.get().then((data) => {
        const docs = data.docs;

        docs.map((doc) => {
          const itemSelecionado = {
            nome: doc.data().nome,
            ano: doc.data().ano,
            posterURL: doc.data().posterURL,
          };

          resposta.push(itemSelecionado);
        });
        return resposta;
      });

      return res.status(200).send({status: "sucesso", data: resposta});
    } catch (error) {
      console.log("ERROR");
      return res.status(500).send({status: "falhou", msg: error});
    }
  })();
});


// ACRESCENTAR FILMES NOVOS - post()
app.post("/api/create", (req, res) => {
  const {nome, ano, posterURL} = req.body;

  (async () => {
    try {
      await db.collection("filmes").doc(`/${Date.now()}/`).create({
        id: Date.now(),
        nome: nome,
        ano: ano,
        posterURL: posterURL,
      });

      return res.status(200).send({
        status: "sucesso",
        msg: "Dados salvos",
      });
    } catch (error) {
      return res.status(400).json("Erro");
    }
  })();
});


// DELETAR FILME PRESENTE NO CATALOGO - delete()

app.delete("/api/delete/:id", (req, res) => {
  const {id} = req.body;

  (async () => {
    try {
      const dados = db.collection("filmes").doc(req.params.id);
      await dados.delete();

      return res.status(200).send({
        status: "sucesso",
        msg: "Dados removidos",
      });
    } catch (error) {
      return res.status(500).send({status: "falhou", msg: error});
    }
  })();
});


// todo EXPORTAR A API PARA UMA FUNCAO EM NUVEM DO FIREBASE
exports.app = functions.https.onRequest(app);

