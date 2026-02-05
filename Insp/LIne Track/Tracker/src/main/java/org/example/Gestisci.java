package org.example;

import java.util.LinkedList;
import java.util.List;

public class Gestisci {
LinkedList<String> temp;
    public Gestisci(LinkedList<String> list){
        temp = list;
    }

    /*
    Metodo che permette di far scorrere i membri che hanno lavato
    * */
    public void Popop(){
        String n1 = temp.getFirst();
        temp.removeFirst();
        temp.addLast(n1);
    }

    /*
    Metodo che permette di mettere secondo il primo della lista se non può lavare quel giorno
    * */
    public void Shift(){
        String n1 = temp.removeFirst();
        temp.add(1, n1);
    }

    /*
    Metodo che ritorna a chi tocca oggi
    * */
    public String Turno(){
        return temp.getFirst();
    }

    public List<String> getNomi(){
        return temp;
    }

}