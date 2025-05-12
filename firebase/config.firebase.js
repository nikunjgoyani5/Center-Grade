import admin from "firebase-admin";

admin.initializeApp({
  credential: admin.credential.cert({
    type: "service_account",  
    project_id: "card-centering-79372",
    private_key_id: "27881e78262787f4d67c97e2abd6d01b11714c6a",
    private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQCr6KSlviGM6UVq\nFVf2FqNE8Li2H3Tvv44w6KFO++wERr0PzHA2zv/Wao7nA/q/+p4h+c8Lmc4IERfz\nGlSj7QsJMwe4xt/k/l1hqBYWOyPQYf8imfG2vBEBJyPE2Zd6A9eVQiAZLNfQnTix\n5kNyJCefMwQg/PGNaqufMA6WmtRv5Ke4tZGU3X6DYkx4zKATiPZFYwMVmQT8fqx9\n2vbr0xGwawZSvGQZ67ekP5SNWwcX0nIQVyy9RM/AsXlt39AbfKWipmwB4KVGWBMI\nvXOrZN0HwJLLtf+i6fHWBa/Ar6vZTqkKSTa2blDuVVo94gAaejYh5zP4MYZlk+ve\nUDgH27WtAgMBAAECggEADDoDKoCf1+r9aLf05h1NER8ChtLXmSJUJXleLlpvj7b3\nmmiNcJsqCgt7zMV1L535DOySA761hHsGwN/Atln/0hstiOr9dfF7cxx72aqXd6oz\nSw2M6f9tQYTm9TNj+SXNzvasMW4wOUz9VnXMmpEkukdsG0EyQunGeWTMcidimu9C\nqzZ/+SgDhgUzJFAjml8QZLdkacqthk+Rce/AcIKwSnOcPWzVQ4lf1wVrE4HnRRQQ\n/UtGd9TuuQqNdTUrRbLkrRaNP8DOjdHjQoN/QVzqkSnCa6e3e1ihs9e2kU9zHeFN\no0rn7rgRg9VZxR7dBezqOjmTa4WGkRc5MhKHNm7jFwKBgQDUqodkF48bG+QWRSA3\nOksOWl2WAkglWt1W3fb/eREOQX6P2/XCQ/r6++7NyKgyAm7juQGEYC/fDHDxxf9C\n1pH0PDZ1ORtOjU6UEORDkIrYjb4r3BRNeyJ7AoouBBJmmcL5TWKvzdNi+IhaWBZ+\n9p80jaYnjmFSt8ahuIKGRJhIZwKBgQDO8A49U2t6VRBJLTkYt45vLzM9+p+fkMz7\nufMDSbAE4+KfB+4vELeuDdMOD59NMt0Mcw48VebSOVJhKzA57GH9eiRMvRHF7GkZ\n9o2CVKNpIodDPdU0gk1vKnljWGrm6TQmMKCsHH9Fzc6Fx8qGueojTXh5mhCs4D2p\nkTyX7JPUywKBgQCrNvu31svNHIBeeZq9O/5PeOtdqUqiYGxQ0nVYKwVTP+GAOqu6\nknaO+KPDI2hektzqE/mntLT105Ne43RmQE/TnWKOr8JPVK7NwGe2CbnvLPbNYusp\nkhgphtruvzJ9Tg/OHMJ2HbSxOry0V7UM1MtKSTxbHmM2cGTHsL/ND462wwKBgQDO\nSyeW4TNy55vtp0SVLF+03VPzBIbedmayx6PH8kykA13m9evvRXYm8KcnDFHdjsgo\nYgaeBXCuv/As5/YSuGDTZVEMoys1qUD5Xf2iIKgq5f37/Ycu6nsxSCFs9TbU7URM\nkguKqHoEZ2/rk8mFV49fFBr29qyK+pzeDuhd971D0wKBgQC/lUd9cbWEQRZjp+Km\n7Nb304q4AwXpFl8WwAfhMt1G+p7IF/ubD/NftM8OZYn0zSwpUEqCzHGp6b2bkATH\n2VV7N1kJSzOMR9xCQwFmdKROAB3CRwk9q60tt6rrsj9sNdRKIXGTnSKJeuChSUv/\nHypuZdDy5iIGRcz3XgCtMGG2uQ==\n-----END PRIVATE KEY-----\n",
    client_email: "firebase-adminsdk-fbsvc@card-centering-79372.iam.gserviceaccount.com",
    client_id: "499269900230-8ltikjj78advfk5fvvnit7uhg8337kt5.apps.googleusercontent.com",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40card-centering-79372.iam.gserviceaccount.com",
    universe_domain: "googleapis.com"
  }),
});

export default admin;