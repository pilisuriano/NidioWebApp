"""
Nidio -- ml-service/src/models/valuation_schemas.py

Esquemas Pydantic del contrato /predict EXTENDIDO. CORREGIDO (07/08/2026) despues de
leer el codigo Java real del repo (MlServiceClient.java, ValuationCreateRequest.java,
CreatePropertyRequest.java) -- version anterior de este archivo tenia 2 problemas
respecto del contrato real:
  1. Usaba el nombre `surfaceTotalM2`, pero el repo real ya usa `totalSurfaceM2` en
     todos lados (columna `total_surface_m2` desde V16, DTOs Java `totalSurfaceM2`) --
     corregido para no crear un campo duplicado con otro nombre.
  2. Tenia un campo `currency` en la respuesta -- innecesario: se confirmo (07/08/2026,
     ver bitacora 6.41 adendum) que todo el sistema trabaja en USD siempre, y el
     `PredictResponse` real de Java (`MlServiceClient.java`) no tiene ese campo -- si se
     manda, Jackson podria rechazar la respuesta segun la configuracion del proyecto.

Contrato real minimo, ya existente y funcionando (ver MlServiceClient.PredictRequest):
    {operationType, propertyType, neighborhood, surfaceM2, rooms} -> {min, max}
Este archivo lo EXTIENDE (no lo reemplaza) con los campos opcionales que el modelo usa,
mas la explicacion en texto (SHAP, ver bitacora del modelo 6.30).

Convenciones:
- JSON en camelCase (alias automatico), igual que el contrato minimo ya usado.
- Todos los campos nuevos son OPCIONALES -- el modelo maneja campos faltantes
  nativamente (NaN de XGBoost, ver predecir_propiedad_nueva.py).
- `declaredPrice` es opcional y NO reemplaza la clasificacion que ya vive en Java
  (ValuationService.compare()) -- solo enriquece `explanationText`.
"""
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


class OperationType(str, Enum):
    SALE = "SALE"
    RENT = "RENT"


class PropertyType(str, Enum):
    APARTMENT = "APARTMENT"
    HOUSE = "HOUSE"
    PH = "PH"


class PropertyCondition(str, Enum):
    NEW = "NEW"
    USED_GOOD_CONDITION = "USED_GOOD_CONDITION"
    NEEDS_RENOVATION = "NEEDS_RENOVATION"
    NOT_SPECIFIED = "NOT_SPECIFIED"


class ValuationRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)

    operation_type: OperationType
    property_type: PropertyType
    neighborhood: str
    surface_m2: float  # superficie CUBIERTA -- mismo campo que ya existe en el contrato minimo
    rooms: int

    # --- Campos nuevos, todos opcionales ---
    total_surface_m2: float | None = None  # <-- nombre corregido (antes surface_total_m2)
    bathrooms: int | None = None
    property_condition: PropertyCondition | None = None
    expenses_usd: float | None = None  # siempre en USD
    has_pool: bool | None = None
    has_garage: bool | None = None
    building_amenities: bool | None = None
    # OJO -- alias EXPLICITO, no se puede dejar que alias_generator=to_camel lo derive
    # solo (bug real encontrado 07/08/2026, ver bitacora): to_camel("security_24h")
    # da "security24H" (con H mayuscula, por como Python .title() trata el limite
    # entre un digito y la letra siguiente), pero el JSON real que manda Java/el
    # frontend usa "security24h" (h minuscula, nombre literal del campo Java) -- sin
    # este alias explicito, este campo nunca se poblaba desde ningun request HTTP
    # real, quedaba siempre en None/False en silencio (sin error).
    security_24h: bool | None = Field(default=None, alias="security24h")
    bright: bool | None = None
    apto_credito: bool | None = None
    furnished: bool | None = None
    declared_price: float | None = None  # siempre en USD


class ExplanationFactor(BaseModel):
    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)

    factor: str          # ya viene redactado en español, listo para mostrar
    contribution: float  # USD
    direction: str        # "sube el precio" | "baja el precio" | "neutro"


class ValuationResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)

    min: float
    max: float
    # SIN campo `currency` -- siempre USD, confirmado (ver docstring arriba).
    explanation: list[ExplanationFactor]
    explanation_text: str
