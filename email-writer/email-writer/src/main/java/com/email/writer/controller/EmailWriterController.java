package com.email.writer.controller;


import com.email.writer.dto.EmailRequest;
import com.email.writer.service.EmaliGeneratorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/email")
@CrossOrigin(origins = "*")
public class EmailWriterController {

    private final EmaliGeneratorService emaliGeneratorService;

    public EmailWriterController(EmaliGeneratorService emaliGeneratorService) {
        this.emaliGeneratorService = emaliGeneratorService;
    }

    @GetMapping("/")
    public String greeting(){
        return "hello from email writer ";
    }


    @PostMapping("/generate")
    public ResponseEntity<String> generateEmail(@RequestBody EmailRequest emailRequest){
        
        return  ResponseEntity.ok(emaliGeneratorService.generateEmail(emailRequest));
    }

}
