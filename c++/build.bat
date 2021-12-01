@echo off

set IMGUI_ROOT=imgui-1.79
set EXAMPLES_ROOT=%IMGUI_ROOT%\examples

mkdir Debug
cl.exe /nologo /std:c++latest /EHsc /Zi /MD /I %EXAMPLES_ROOT% /I %IMGUI_ROOT% /I %EXAMPLES_ROOT%\libs\glfw\include /I %VULKAN_SDK%\include *.cpp %EXAMPLES_ROOT%\imgui_impl_vulkan.cpp %EXAMPLES_ROOT%\imgui_impl_glfw.cpp %IMGUI_ROOT%\imgui*.cpp /FeDebug/advent2020.exe /FoDebug/ /link /LIBPATH:%EXAMPLES_ROOT%\libs\glfw\lib-vc2010-64 /libpath:%VULKAN_SDK%\lib glfw3.lib opengl32.lib gdi32.lib shell32.lib vulkan-1.lib

::mkdir Release
::cl /nologo /std:c++latest /EHsc /Zi /MD /Ox /Oi /I %EXAMPLES_ROOT% /I %IMGUI_ROOT% /I %EXAMPLES_ROOT%\libs\glfw\include /I %VULKAN_SDK%\include *.cpp %EXAMPLES_ROOT%\imgui_impl_vulkan.cpp %EXAMPLES_ROOT%\imgui_impl_glfw.cpp %IMGUI_ROOT%\imgui*.cpp /FeRelease/advent2020.exe /FoRelease/ /link /LIBPATH:%EXAMPLES_ROOT%\libs\glfw\lib-vc2010-64 /libpath:%VULKAN_SDK%\lib32 glfw3.lib opengl32.lib gdi32.lib shell32.lib vulkan-1.lib

EXIT /B 0