source 'environment'
rsync -avh --exclude '.git/' --exclude 'build/' --exclude 'node_modules/' ../public pi@"$DEVELOPMENT_SERVER":~/flux-studio-public
