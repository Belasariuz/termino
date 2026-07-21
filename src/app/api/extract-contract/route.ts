import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function buildExtractionSchema(categoryNames: string[]) {
  return {
  type: "object",
  properties: {
    partij: { type: "string", description: "Naam van de contractpartij" },
    type: {
      type: "string",
      enum: categoryNames,
      description:
        "Kies de best passende categorie uit de gegeven lijst van de gebruiker.",
    },
    begindatum: { type: "string", description: "Begindatum in formaat YYYY-MM-DD" },
    einddatum: { type: "string", description: "Einddatum in formaat YYYY-MM-DD" },
    opzegtermijn_dagen: { type: "integer", description: "Opzegtermijn in dagen" },
    verlengingswijze: {
      type: "string",
      enum: ["stilzwijgend", "actief"],
      description: "Stilzwijgende verlenging of actieve verlenging",
    },
    contractwaarde: {
      anyOf: [{ type: "number" }, { type: "null" }],
      description: "Contractwaarde in euro's, null als onbekend",
    },
    confidence: {
      type: "object",
      description: "Betrouwbaarheidsscore per veld tussen 0 en 1",
      properties: {
        partij: { type: "number" },
        type: { type: "number" },
        begindatum: { type: "number" },
        einddatum: { type: "number" },
        opzegtermijn_dagen: { type: "number" },
        verlengingswijze: { type: "number" },
        contractwaarde: { type: "number" },
      },
      required: [
        "partij",
        "type",
        "begindatum",
        "einddatum",
        "opzegtermijn_dagen",
        "verlengingswijze",
        "contractwaarde",
      ],
      additionalProperties: false,
    },
    reasoning: {
      type: "object",
      description:
        "Korte toelichting per veld (1-2 zinnen): waar in het document dit gevonden is en hoe de waarde is afgeleid",
      properties: {
        partij: { type: "string" },
        type: { type: "string" },
        begindatum: { type: "string" },
        einddatum: { type: "string" },
        opzegtermijn_dagen: { type: "string" },
        verlengingswijze: { type: "string" },
        contractwaarde: { type: "string" },
      },
      required: [
        "partij",
        "type",
        "begindatum",
        "einddatum",
        "opzegtermijn_dagen",
        "verlengingswijze",
        "contractwaarde",
      ],
      additionalProperties: false,
    },
  },
  required: [
    "partij",
    "type",
    "begindatum",
    "einddatum",
    "opzegtermijn_dagen",
    "verlengingswijze",
    "contractwaarde",
    "confidence",
    "reasoning",
  ],
  additionalProperties: false,
  };
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }

  const { data: categories } = await supabase
    .from("categories")
    .select("naam")
    .order("naam", { ascending: true });

  const categoryNames = (categories ?? []).map((c) => c.naam);
  if (categoryNames.length === 0) {
    return NextResponse.json(
      { error: "Je hebt nog geen categorieën. Voeg er eerst een toe via 'Categorieën beheren'." },
      { status: 400 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Geen bestand ontvangen." }, { status: 400 });
  }

  const MAX_FILE_SIZE = 20 * 1024 * 1024;
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "Het bestand is groter dan 20 MB." },
      { status: 400 },
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const bytes = Buffer.from(arrayBuffer);

  // Vertrouw niet op de MIME-type/bestandsnaam van de client: controleer de
  // PDF-magic bytes zelf, zodat een willekeurig bestand niet als "PDF" wordt
  // opgeslagen en naar de Anthropic API wordt gestuurd.
  const isPdf = bytes.subarray(0, 5).toString("latin1") === "%PDF-";
  if (!isPdf) {
    return NextResponse.json(
      { error: "Het bestand is geen geldig PDF-bestand." },
      { status: 400 },
    );
  }

  const base64 = bytes.toString("base64");

  const storagePath = `${user.id}/${crypto.randomUUID()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from("contracts")
    .upload(storagePath, bytes, { contentType: "application/pdf" });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  try {
    const anthropic = new Anthropic();
    const response = await anthropic.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 2048,
      output_config: {
        format: { type: "json_schema", schema: buildExtractionSchema(categoryNames) },
      },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: base64,
              },
            },
            {
              type: "text",
              text: `Extraheer de contractgegevens uit dit Nederlandse (of Engelse) huurcontract of vergelijkbaar contract. Kies voor het veld "type" de best passende categorie uit deze lijst: ${categoryNames.join(", ")}. Geef per veld ook een betrouwbaarheidsscore tussen 0 en 1, waarbij 1 volledig zeker is, en een korte toelichting (1-2 zinnen, in het Nederlands) waarin je aangeeft waar in het document je dit gevonden hebt en hoe je tot deze waarde kwam. Gebruik het formaat YYYY-MM-DD voor data.`,
            },
          ],
        },
      ],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("Geen tekstantwoord van Claude ontvangen.");
    }

    const fields = JSON.parse(textBlock.text);

    return NextResponse.json({
      fields,
      pdf_url: storagePath,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Onbekende fout bij AI-extractie.";
    return NextResponse.json(
      { error: message, pdf_url: storagePath },
      { status: 502 },
    );
  }
}
