package org.example;

import com.google.gson.Gson;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.LinkedList;

public class Main {
    public static void main(String[] args) {

            Gson gson = new Gson();

            // Lettura corretta da resources
            InputStream inputStream = Main.class
                    .getClassLoader()
                    .getResourceAsStream("nomi.json");
            if (inputStream == null) {
                throw new RuntimeException("File nomi.json Non trovato in resources!");
            }

            //Legge il Json
            InputStreamReader reader = new InputStreamReader(inputStream);
            ListaNomi lista = gson.fromJson(reader, ListaNomi.class);

            //Popola la linkedlist con i nomi del Json
            LinkedList<String> linkedList = new LinkedList<>(lista.getNomi());

            Gestisci gestisci = new Gestisci(linkedList);

            System.out.println("---------------------------------");
            System.out.println("####Teller Machine Lavapiatti####");
            System.out.println("---------------------------------");
            System.out.println("Lunedi tocca a: "+ gestisci.Turno());
            System.out.println(gestisci.Turno()+" c'era, la lista scorre");
            gestisci.Popop();
            System.out.println("Martedi tocca a: " + gestisci.Turno());
            System.out.println(gestisci.Turno()+" oggi non c'e', verra' messo all'inizio della lista");
            gestisci.Shift();
            System.out.println("Martedi ha lavato "+ gestisci.Turno());
            gestisci.Popop();
            System.out.println("Mercoledi tocca a: "+ gestisci.Turno());
            System.out.println(gestisci.getNomi());

    }
}
