"""Limpieza, filtrado por rango intercuartílico (IQR) y filtrado geográfico de CABA."""


def remove_outliers_iqr(df, column, factor: float = 1.5):
    """Filtra filas de `df` cuyo valor en `column` cae fuera del rango IQR."""
    q1 = df[column].quantile(0.25)
    q3 = df[column].quantile(0.75)
    iqr = q3 - q1
    lower_bound = q1 - factor * iqr
    upper_bound = q3 + factor * iqr
    return df[(df[column] >= lower_bound) & (df[column] <= upper_bound)]


def filter_caba_bounds(df, lat_column: str = "lat", lon_column: str = "lon"):
    """Filtra filas fuera de los límites geográficos aproximados de CABA."""
    caba_lat_bounds = (-34.70, -34.53)
    caba_lon_bounds = (-58.53, -58.33)
    return df[
        df[lat_column].between(*caba_lat_bounds)
        & df[lon_column].between(*caba_lon_bounds)
    ]
