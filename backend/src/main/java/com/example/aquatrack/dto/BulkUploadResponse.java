package com.example.aquatrack.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class BulkUploadResponse {
    private int successful = 0;
    private int skippedDuplicates = 0;
    private List<String> errors = new ArrayList<>();
}
