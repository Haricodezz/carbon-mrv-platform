# =========================
# BASE IMAGE (Bookworm — avoids Trixie pulling Debian Python 3.13 over image Python)
# =========================
FROM python:3.12-slim-bookworm

# =========================
# ENV SETTINGS
# =========================
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_DEFAULT_TIMEOUT=100

# =========================
# SYSTEM DEPENDENCIES
# rasterio/geopandas wheels need GDAL/GEOS/PROJ libs at build/runtime.
# Do NOT install gdal-bin — it pulls python3-gdal and corrupts /usr/local Python.
# =========================
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    g++ \
    libpq-dev \
    curl \
    libgeos-dev \
    libproj-dev \
    proj-data \
    libgdal-dev \
    && rm -rf /var/lib/apt/lists/* \
    && ldconfig

# =========================
# WORKDIR
# =========================
WORKDIR /app

# =========================
# COPY REQUIREMENTS
# =========================
COPY requirements.txt .

# =========================
# INSTALL PYTHON PACKAGES
# Exclude geemap/Jupyter stack (not imported by the API) to speed builds and reduce conflicts.
# =========================
RUN sed 's/\r$//' requirements.txt \
    | grep -viE '^(geemap|earthengine-api|eerepr|folium|branca|geocoder|geopandas|sentinelhub|ipyleaflet|jupyter-|ipywidgets|ipyevents|ipyfilechooser|ipython|bqplot|bqscales|anywidget|widgetsnbextension|matplotlib|contourpy|cycler|fonttools|kiwisolver|plotly|narwhals|scooby)==' \
    > requirements.docker.txt \
    && test -s requirements.docker.txt \
    && python -c "import sys; print(sys.version)" \
    && python -m pip install --upgrade pip setuptools wheel \
    && python -m pip install --no-cache-dir -r requirements.docker.txt

# =========================
# COPY PROJECT FILES
# =========================
COPY . .

# =========================
# STORAGE DIRECTORIES
# =========================
RUN mkdir -p /app/storage/certificates

# =========================
# STARTUP SCRIPT
# =========================
RUN chmod +x /app/start.sh

# =========================
# EXPOSE PORT
# =========================
EXPOSE 8000

# =========================
# START COMMAND
# =========================
CMD ["/app/start.sh"]
