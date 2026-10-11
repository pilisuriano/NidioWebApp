package com.nidio.model;

// De dónde salió un destacado: del incluido en el plan del mes, de un pack de 5,
// del destacado de bienvenida (uno por cuenta, único) o de un pago suelto.
public enum FeaturedSource {
    INCLUDED,
    PACK,
    WELCOME,
    PAID
}
