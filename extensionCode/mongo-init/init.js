// This file is auto-executed by the official mongo image on FIRST startup only
// (i.e. when /data/db is empty). It runs against the DB named in MONGO_INITDB_DATABASE.

db = db.getSiblingDB("usersColsData");

db.usersInsights.insertMany([
  {
    _id: ObjectId("6a656b508947a2fa90393716"),
    userId: "anonymous",
    timestamp: ISODate("2026-07-26T02:04:52.967Z"),
    nombre: null,
    numeroIdentificacion: null,
    tipoIdentificacion: null,
    merchant: "MercadoLibre",
    url: "https://www.mercadolibre.com.co/silla-para-bicicleta-sillin-galapago-antiprostatico-gw-as1/p/MCO27776447",
    extensionStorage: {
      colsubsidio_logged_in: "true",
      colsubsidio_user_name: "Juan Felipe Reyes",
      numero_documento_usuario: "11078294763",
      tipo_documento_usuario: "CC"
    },
    product: {
      id: "MCO27776447",
      title: "Silla Para Bicicleta Sillín Galapago Antiprostático Gw As1 | Cuotas sin interés",
      brand: "GW",
      category: ["MCO1276", "MCO1292", "MCO1934", "MCO158243"],
      price: 29990,
      currency: "COP",
      rating: 4.6,
      quantity: 1,
      sold: 1000,
      freeShipping: false,
      condition: "new"
    },
    insight: {
      interest: "Cycling",
      detectedIntent: "Purchase",
      purchaseStage: "Decision",
      estimatedCredit: "Sports Equipment Credit",
      cashback: "5%",
      confidence: 0.95,
      urgency: "Medium",
      reasoning: "The shopper is viewing a specific bicycle saddle with installment options, indicating high purchase intent for cycling gear. Offering sports-specific credit and bicycle insurance aligns perfectly with this purchase.",
      recommendedProducts: ["Sports Equipment Credit", "Bicycle Insurance", "Sports Cashback Program"]
    }
  },
  {
    _id: ObjectId("6a655bec9b4a1bbd1f38096c"),
    userId: "anonymous",
    timestamp: ISODate("2026-07-26T00:59:13.304Z"),
    nombre: null,
    numeroIdentificacion: null,
    tipoIdentificacion: null,
    merchant: "MercadoLibre",
    url: "https://www.mercadolibre.com.co/guantes-largos-torch-azul-para-bicicleta-gw-bicyle-celeste-xxl/p/MCO69612135#polycard_client=recommendations_home_navigation-related-recommendations&reco_backend=recomm_platform_exp_com_org_rfa&wid=MCO3955957242&reco_client=home_navigation-related-recommendations&reco_item_pos=3&reco_backend_type=function&reco_id=15e11cac-0d6c-4b21-828c-ccf1b99546a8&sid=recos&c_id=/home/navigation-related-recommendations/element&c_uid=081519a8-bda3-4f47-bd3a-d2fc449fe9cd",
    extensionStorage: {
      colsubsidio_logged_in: "true",
      colsubsidio_user_name: "Juan Felipe Reyes",
      numero_documento_usuario: "11078294763",
      tipo_documento_usuario: "CC"
    },
    product: {
      id: "MCO69612135",
      title: "Guantes Largos Torch Azul Para Bicicleta Gw Bicyle Celeste Xxl | Cuotas sin interés",
      brand: "GW Bicycle",
      category: ["MCO1276", "MCO1292", "MCO1935", "MCO158232"],
      price: 82600,
      currency: "COP",
      rating: 4.9,
      quantity: 2,
      sold: 0,
      freeShipping: true,
      condition: "new"
    },
    insight: {
      interest: "Cycling",
      detectedIntent: "Purchase",
      purchaseStage: "Decision",
      estimatedCredit: "Sports Equipment Credit",
      cashback: "5%",
      confidence: 0.95,
      urgency: "Medium",
      reasoning: "The shopper is viewing a specific model and size of GW Bicycle gloves with interest-free installment options, indicating high purchase intent for cycling accessories.",
      recommendedProducts: ["Sports Equipment Credit", "Bicycle Insurance", "Sports Cashback Program"]
    }
  }
]);

print("init.js: seeded usersColsData.usersInsights with", db.usersInsights.countDocuments(), "documents");