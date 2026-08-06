"""
Nidio -- ml-service/src/models/valuation_schemas.py

Esquemas Pydantic del contrato /predict EXTENDIDO (ver documento de integracion,
Pili/compañera, 05/08/2026). Reemplaza/extiende el contrato minimo anterior
({operationType, propertyType, neighborhood, surfaceM2, rooms} -> {min, max}) para
llevar TODOS los campos que el modelo XGBoost real usa, mas la explicacion en texto
(SHAP, ver bitacora del modelo 6.30) que antes no existia en ningun lado.

Convenciones:
- JSON en camelCase (alias automatico) para no romper la convencion ya usada en el
  contrato minimo (operationType, propertyType, surfaceM2).
- Todos los campos nuevos son OPCIONALES (nullable) -- una propiedad puede no tener
  todos los datos, el modelo ya maneja campos faltantes nativamente (NaN de XGBoost,
  ver predecir_propiedad_nueva.py).
- `declaredPrice` es opcional y NO reemplaza la logica de clasificacion que ya vive en
  Java (comparar precio contra rango) -- solo se usa para enriquecer `explanationText`
  con frases del tipo "supera el maximo esperado en un X%". Si no se manda, el texto
  sale igual, solo sin esa frase puntual.
"""
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, ConfigDict
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
    surface_m2: float  # superficie CUBIERTA -- mismo campo que ya existia en el contrato minimo
    rooms: int

    # --- Campos nuevos, todos opcionales ---
    surface_total_m2: Optional[float] = None
    bathrooms: Optional[int] = None
    property_condition: Optional[PropertyCondition] = None
    expenses_usd: Optional[float] = None  # ya en USD -- si se carga en ARS, convertir ANTES de llamar a este servicio
    has_pool: Optional[bool] = None
    has_garage: Optional[bool] = None
    building_amenities: Optional[bool] = None
    security_24h: Optional[bool] = None
    bright: Optional[bool] = None
    apto_credito: Optional[bool] = None
    furnished: Optional[bool] = None
    declared_price: Optional[float] = None  # en la MISMA moneda que la respuesta (ver currency)


class ExplanationFactor(BaseModel):
    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)

    factor: str          # ya viene redactado en español, listo para mostrar ("la superficie", "el barrio/zona", ...)
    contribution: float  # misma unidad/moneda que min/max de la respuesta
    direction: str        # "sube el precio" | "baja el precio" | "neutro"


class ValuationResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)

    min: float
    max: float
    currency: str  # "ARS" o "USD" -- ver VALUATION_CONVERTIR_A_ARS en valuation.py, pendiente confirmar con el equipo
    explanation: List[ExplanationFactor]
    explanation_text: str