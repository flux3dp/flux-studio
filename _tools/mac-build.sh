DIR="$( cd "../$( dirname "$0" )" && pwd)"

source ./environment

chmod -R 777 ./nwjs-shell-builder/

#Unzip latest ghost
echo "${COLOR_YELLOW}Downloading latest ghost${COLOR_RESET}"
cp $GHOST_SRC/fluxghost-$GHOST_VERSION-osx.zip latest-ghost-osx.zip
rm -r osx-cache
mkdir osx-cache
unzip latest-ghost-osx.zip -d osx-cache > .zip_log
rm -r $DIR/public/lib
mkdir $DIR/public/lib
mv osx-cache/dist/ghost $DIR/public/lib
cp -r ../../mac-slic3r.app $DIR/public/lib/Slic3r.app

#Pack nwjs
echo "${COLOR_YELLOW}Packing nwjs...${COLOR_RESET}"
./nwjs-shell-builder/nwjs-build.sh --clean
./nwjs-shell-builder/nwjs-build.sh --src=$DIR/public --name="$PACKAGE_NAME" --osx-icon=../../icon.icns --version="1.0.0" --nw=0.12.3 --target="5" --build

#Pack image
./dmg-build.sh

rm -r osx-cache

echo "${COLOR_GREEN}FLUX Studio for Mac packed successfully.${COLOR_RESET}"