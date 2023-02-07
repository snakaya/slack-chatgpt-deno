import { assertEquals } from "https://deno.land/std@0.176.0/testing/asserts.ts";
import * as mod from "https://deno.land/std@0.176.0/testing/bdd.ts";
import { verifySubscriptionURL } from "../src/handlers/verifySubscriptionURL.ts";


const bodytextNormal1 = {
  token: "Jhj5dZrVaK7ZwHHjRyZWjbDl",
  challenge: "3eZbrw1aBm2rZgRNFdxV2595E9CY3gmdALWMmHkvFXO7tYXAYM8P",
  type: "url_verification",
};
const bodytextError1 = {
  challenge: "3eZbrw1aBm2rZgRNFdxV2595E9CY3gmdALWMmHkvFXO7tYXAYM8P",
  type: "url_verification",
};
const bodytextError2 = {
  token: "Jhj5dZrVaK7ZwHHjRyZWjbDl",
  challengexxx: "3eZbrw1aBm2rZgRNFdxV2595E9CY3gmdALWMmHkvFXO7tYXAYM8P",
  type: "url_verification",
  lengthy: "lebthy_data",
};
const tokenNormal1 = "Jhj5dZrVaK7ZwHHjRyZWjbDl";


mod.describe("verifySubscriptionURL Normal", () => {
  mod.it("Normal (return challenge)", () => {
    const testAnswer = verifySubscriptionURL(
      JSON.stringify(bodytextNormal1),
      tokenNormal1,
    );
    assertEquals(testAnswer.statusCode, 200);
    assertEquals(testAnswer.contentType, "text/plain");
    assertEquals(testAnswer.message, bodytextNormal1.challenge);
  });
});

mod.describe("verifySubscriptionURL Parameter Error", () => {
  mod.it("BodyText is empty value", () => {
    const testAnswer = verifySubscriptionURL("", tokenNormal1);
    assertEquals(testAnswer.statusCode, 500);
    assertEquals(testAnswer.contentType, "text/plain");
    assertEquals(testAnswer.message.startsWith("Unknown other error"), true);
  });
  mod.it("token is empty value", () => {
    const testAnswer = verifySubscriptionURL(
      JSON.stringify(bodytextNormal1),
      "",
    );
    assertEquals(testAnswer.statusCode, 400);
    assertEquals(testAnswer.contentType, "text/plain");
    assertEquals(testAnswer.message.startsWith("Unmatch token error"), true);
  });
  mod.it("Missing token", () => {
    const testAnswer = verifySubscriptionURL(
      JSON.stringify(bodytextError1),
      tokenNormal1,
    );
    assertEquals(testAnswer.statusCode, 500);
    assertEquals(testAnswer.contentType, "text/plain");
    assertEquals(testAnswer.message.startsWith("Unknown other error"), true);
  });
  mod.it("Unmatch token", () => {
    const testAnswer = verifySubscriptionURL(
      JSON.stringify(bodytextNormal1),
      "unmatch_token",
    );
    assertEquals(testAnswer.statusCode, 400);
    assertEquals(testAnswer.contentType, "text/plain");
    assertEquals(testAnswer.message.startsWith("Unmatch token error"), true);
  });
  mod.it("Invalid type", () => {
    bodytextNormal1.type = "invalid";
    const testAnswer = verifySubscriptionURL(
      JSON.stringify(bodytextNormal1),
      tokenNormal1,
    );
    assertEquals(testAnswer.statusCode, 400);
    assertEquals(testAnswer.contentType, "text/plain");
    assertEquals(testAnswer.message.startsWith("Unmatch type error"), true);
  });
  mod.it("Invalid JSON velues (type error)", () => {
    const testAnswer = verifySubscriptionURL(
      JSON.stringify(bodytextError2),
      tokenNormal1,
    );
    assertEquals(testAnswer.statusCode, 500);
    assertEquals(testAnswer.contentType, "text/plain");
    assertEquals(testAnswer.message.startsWith("Unknown other error"), true);
  });
});
