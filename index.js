// * Boilerplate para API Firebase com os filmes listados e registro de usuários

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
  res.json("SUCCESSO");
});

// ROUTE PRINCIPAL - LISTA COMPLETA - get()
app.get("/api/getAll", (req, res) => {
  (async () => {
    try {
    // Selecionar colecao "filmes" da minha base de dados firebase
      const query = db.collection("filmes");
      const resposta = [];

      await query.get().then((data) => {
        const docs = data.docs;
        
        docs.map((doc) => {
          // const id = doc.data().id + "";
          const itemSelecionado = {
            nome: doc.data().nome,
            ano: doc.data().ano,
            posterURL: doc.data().posterURL,
            id: doc.data().id
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
      const id = Date.now();
      await db.collection("filmes").doc(`/${id}/`).create({
        id: id,
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

// MODIFICAR INFORMACOES DE FILME LISTADO - put()

app.put("/api/update/:id", (req, res) => {
    const { nome, ano, posterURL } = req.body;
  
    (async () => {
      try {
        const dados = db.collection("filmes").doc(req.params.id);
        await dados.update({
            nome: nome,
            ano: ano,
            posterURL: posterURL
        });

  
        return res.status(200).send({
          status: "sucesso",
          msg: "Dados atualizados!",
        });
      } catch (error) {
        return res.status(500).send({status: "falhou", msg: error});
      }
    })();
  });


// DELETAR FILME PRESENTE NO CATALOGO - delete()

app.delete("/api/delete/:id", (req, res) => {
  (async () => {
    try {
      const doc = db.collection("filmes").doc(req.params.id);
      await doc.delete();

      return res.status(200).send({
        status: "sucesso",
        msg: "Dados removidos",
      });
    } catch (error) {
      return res.status(500).send({status: "falhou", msg: error});
    }
  })();
});

// * GESTAO DE PAGINAS DE USUARIO

// ADICIONAR INFORMACOES DE USUARIO EM COLECAO A PARTE - post()
app.post("/api/novoUser", (req, res) => {
  const {nome, nascimento, aboutme, email} = req.body;

  (async () => {
    try {
      await db.collection("usuarios").doc(`/${email}/`).create({
        id: Date.now(),
        nome: nome,
        nascimento: nascimento,
        aboutme: aboutme,
        email: email
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

// PEGAR DADOS DO USUARIO QUE LOGOU - get()
app.get("/api/getUser/:email", (req, res) => {
  (async () => {
    try {
    // Selecionar colecao "filmes" da minha base de dados firebase

      const usuarioReq = db.collection("usuarios").doc(req.params.email);
      let detalhesDoUsuario = await usuarioReq.get();
      let resposta = detalhesDoUsuario.data();
        
      return res.status(200).json({status: 'SUCESSO', data: resposta})
    } catch (error) {
      console.log("ERROR");
      return res.status(500).send({status: "falhou", data: error});
    }
  })();
});


// todo EXPORTAR A API: firebase deploy
exports.app = functions.https.onRequest(app);

