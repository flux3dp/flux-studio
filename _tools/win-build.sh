DIR="$( cd "../$( dirname "$0" )" && pwd)"

source ./environment

chmod -R 777 ./nwjs-shell-builder/

echo "${COLOR_YELLOW}Packing for Windows x86${COLOR_RESET}"
#Unzip latest ghost
echo "${COLOR_CYAN}Unzipping ghost{COLOR_RESET}"
rm -r win-x86-cache
mkdir win-x86-cache
rsync -u $GHOST_SRC/fluxghost-$GHOST_VERSION-win-x86.rar win-x86-cache/latest-ghost-win-x86.rar
unrar x win-x86-cache/latest-ghost-win-x86.rar win-x86-cache > .rar_log
rm -r $DIR/public/lib
mkdir $DIR/public/lib
cp -r ../../slic3r-win32 $DIR/public/lib/Slic3r
mv win-x86-cache/dist/ghost $DIR/public/lib
#Pack nwjs
echo "${COLOR_CYAN}Packing nwjs{COLOR_RESET}"
./nwjs-shell-builder/nwjs-build.sh --clean
./nwjs-shell-builder/nwjs-build.sh --src=$DIR/public --name="$PACKAGE_NAME" --win-icon=../icon.ico --version="1.0.0" --nw=0.12.3 --target="2" --build
#Upload to NAS
echo "${COLOR_CYAN}Uploading{COLOR_RESET}"
mkdir $AUTO_BUILD/fstudio-$(date +%Y%m%d)-win-x86
cp -r ./nwjs-shell-builder/TMP/win-ia32/latest-git/ $AUTO_BUILD/fstudio-$(date +%Y%m%d)-win-x86
cp ./nwjs-shell-builder/TMP/output/FLUX_Studio-$(date +%Y%m%d)-win-ia32.zip $AUTO_BUILD/fstudio-$(date +%Y%m%d)-win-x86.zip
echo "${COLOR_GREEN}FLUX Studio for Windows x86 packed successfully.${COLOR_RESET}"

echo "${COLOR_YELLOW}Packing for Windows x64${COLOR_RESET}"
#unzip latest ghost
echo "${COLOR_CYAN}Unzipping ghost{COLOR_RESET}"
rm -r win-x64-cache
mkdir win-x64-cache
rsync -u $GHOST_SRC/fluxghost-$GHOST_VERSION-win-x64.rar win-x64-cache/latest-ghost-win-x64.rar
unrar x win-x64-cache/latest-ghost-win-x64.rar win-x64-cache > .rar_log
rm -r $DIR/public/lib
mkdir $DIR/public/lib
cp -r ../../slic3r-win64 $DIR/public/lib/Slic3r
mv win-x64-cache/dist/ghost $DIR/public/lib
#Pack nwjs
echo "${COLOR_CYAN}Packing nwjs{COLOR_RESET}"
./nwjs-shell-builder/nwjs-build.sh --clean
./nwjs-shell-builder/nwjs-build.sh --src=$DIR/public --name="$PACKAGE_NAME" --win-icon=../icon.ico --version="1.0.0" --nw=0.12.3 --target="3" --build
#Upload to NAS
echo "${COLOR_CYAN}Uploading{COLOR_RESET}"
mkdir $AUTO_BUILD/fstudio-$(date +%Y%m%d)-win-x64
cp -r ./nwjs-shell-builder/TMP/win-x64/latest-git/ $AUTO_BUILD/fstudio-$(date +%Y%m%d)-win-x64
cp ./nwjs-shell-builder/TMP/output/FLUX_Studio-$(date +%Y%m%d)-win-x64.zip $AUTO_BUILD/fstudio-$(date +%Y%m%d)-win-x64.zip
echo "${COLOR_CYAN}Cleaning cache...{COLOR_RESET}"
rm -r win-x86-cache
rm -r win-x64-cache
echo "${COLOR_GREEN}FLUX Studio for Windows x64 packed successfully.${COLOR_RESET}"