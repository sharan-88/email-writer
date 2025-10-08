package com.email.writer.service;


import com.email.writer.dto.EmailRequest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
public class EmaliGeneratorService {
    @Value("${gemini.api.key}")
    private String GEMINI_API_KEY;
    

    public String generateEmail(EmailRequest emailRequest){
//       01 . build a prompt
//       02 . we have to format the request
//        03 .request the gemini model
//        04 . get response from the model
//        05 . format the response

        String prompt = promptbuilder(emailRequest);

//

        Map<String , Object> requestbody = Map.of(
                "contents", new Object[]{
                        Map.of("parts",new Object[]{
                            Map.of("text",prompt)
                })

        });
        WebClient webClient = WebClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com")
                .defaultHeader("Content-Type", "application/json")
                .defaultHeader("x-goog-api-key", GEMINI_API_KEY)
                .build();

        String response = webClient.post()
                .uri("/v1beta/models/gemini-2.5-flash:generateContent")
                .bodyValue(requestbody)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        return extractResponse(response);
    }

    private String extractResponse(String response) {

        try{
            ObjectMapper mapper =new ObjectMapper();
            JsonNode rootnode = mapper.readTree(response);
            return rootnode.path("candidates")
                    .get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text")
                    .asText();


        }catch(Exception e){
            return "error processing "+e.toString();
        }
    }

    public String promptbuilder(EmailRequest emailRequest){
        StringBuilder prompt = new StringBuilder();
        prompt.append("Convert the following sentence into a grammatically complete email message body using tone provided.\n" +
                "Start directly with a greeting (e.g., \"Hi [Name],\") and include a polite closing (e.g., \"Best regards, [Your Name]\").\n" +
                "Do NOT include a subject line, any headings, or explanations—only the email content itself.");
        if(emailRequest.getTone() !=null && !emailRequest.getTone().isEmpty()){
            prompt.append("use a ").append(emailRequest.getTone()).append("tone to format sentence ");
        }
        if(emailRequest.getName() != null && !emailRequest.getName().isEmpty()){
            prompt.append("use a ").append(emailRequest.getName()).append(" as writer name ");
        }
        prompt.append("\n original sentence :\n").append(emailRequest.getEmailContent());
        return prompt.toString();


    }

}
