mkdir dmg
mkdir osx-cache
rm -rf osx-cache/image
mkdir osx-cache/image
unzip ./nwjs-shell-builder/TMP/output/FLUX_Studio-$(date +%Y%m%d)-osx-x64.zip -d osx-cache/image
mv osx-cache/image/FLUX_Studio.app osx-cache/image/FLUX\ Studio.app
ln -s /Applications osx-cache/image/Applications
rm dmg/fstudio-$(date +%Y%m%d)-osx.dmg
hdiutil create -srcfolder osx-cache/image dmg/fstudio-$(date +%Y%m%d)-osx.dmg
cp dmg/fstudio-$(date +%Y%m%d)-osx.dmg /Volumes/software/autobuild/fstudio-$(date +%Y%m%d)-osx.dmg
rm -rf osx-cache/image
cd ../
echo "fstudio-$(date +%Y%m%d)-osx.dmg has been built."