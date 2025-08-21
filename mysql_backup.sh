#!/bin/bash

# MySQL Docker Backup Script
# Configure these variables according to your setup

# Docker container name
CONTAINER_NAME="mysql_db"

# Backup directory (make sure this directory exists)
BACKUP_DIR="/mnt/mysql_backups"

# Backup filename pattern (will include timestamp)
BACKUP_PREFIX="db_dump"

# Maximum number of backups to keep
MAX_BACKUPS=10

# Generate timestamp for backup filename
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILENAME="${BACKUP_PREFIX}_${TIMESTAMP}.sql"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILENAME}"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Create the backup
echo "Starting MySQL backup at $(date)"
docker exec "$CONTAINER_NAME" sh -c 'exec mysqldump --all-databases -uroot -p"$MYSQL_ROOT_PASSWORD"' > "$BACKUP_PATH"

# Check if backup was successful
if [ $? -eq 0 ] && [ -s "$BACKUP_PATH" ]; then
    echo "Backup completed successfully: $BACKUP_FILENAME"
    
    # Remove old backups, keeping only the most recent MAX_BACKUPS
    cd "$BACKUP_DIR"
    
    # Count current backups with the same prefix
    BACKUP_COUNT=$(ls -1 ${BACKUP_PREFIX}_*.sql 2>/dev/null | wc -l)
    
    if [ $BACKUP_COUNT -gt $MAX_BACKUPS ]; then
        # Calculate how many files to remove
        FILES_TO_REMOVE=$((BACKUP_COUNT - MAX_BACKUPS))
        
        # Remove the oldest files
        ls -1t ${BACKUP_PREFIX}_*.sql | tail -n $FILES_TO_REMOVE | while read file; do
            echo "Removing old backup: $file"
            rm "$file"
        done
    fi
    
    echo "Backup retention completed. Keeping $MAX_BACKUPS most recent backups."
else
    echo "Backup failed!"
    # Remove failed backup file if it exists
    [ -f "$BACKUP_PATH" ] && rm "$BACKUP_PATH"
    exit 1
fi

echo "Backup process finished at $(date)"