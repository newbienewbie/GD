/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#include "GDCore/Project/InitialInstance.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Serialization/SerializerElement.h"
#if defined(GD_IDE_ONLY)
#include "GDCore/IDE/Dialogs/PropertyDescriptor.h"
#endif

namespace gd
{

gd::String * InitialInstance::badStringProperyValue = NULL;

InitialInstance::InitialInstance() :
    objectName(""),
    x(0),
    y(0),
    angle(0),
    zOrder(0),
    layer(""),
    personalizedSize(false),
    width(0),
    height(0),
    locked(false)
{
}

void InitialInstance::UnserializeFrom(const SerializerElement & element)
{
    SetObjectName(element.GetStringAttribute("name", "", "nom"));
    SetX(element.GetDoubleAttribute("x"));
    SetY(element.GetDoubleAttribute("y"));
    SetAngle(element.GetDoubleAttribute("angle"));
    SetHasCustomSize(element.GetBoolAttribute("customSize", false, "personalizedSize"));
    SetCustomWidth(element.GetDoubleAttribute("width"));
    SetCustomHeight(element.GetDoubleAttribute("height"));
    SetZOrder(element.GetIntAttribute("zOrder", 0, "plan"));
    SetLayer(element.GetStringAttribute("layer"));
    SetLocked(element.GetBoolAttribute( "locked", false ));

    floatInfos.clear();
    const SerializerElement & floatPropElement = element.GetChild("numberProperties" , 0 ,"floatInfos");
    floatPropElement.ConsiderAsArrayOf("property", "Info");
    for (std::size_t j = 0; j < floatPropElement.GetChildrenCount(); ++j)
    {
        gd::String name = floatPropElement.GetChild(j).GetStringAttribute("name");
        float value = floatPropElement.GetChild(j).GetDoubleAttribute("value");
        floatInfos[name] = value;
    }

    stringInfos.clear();
    const SerializerElement & stringPropElement = element.GetChild("stringProperties" , 0 ,"stringInfos");
    stringPropElement.ConsiderAsArrayOf("property", "Info");
    for (std::size_t j = 0; j < stringPropElement.GetChildrenCount(); ++j)
    {
        gd::String name = stringPropElement.GetChild(j).GetStringAttribute("name");
        gd::String value = stringPropElement.GetChild(j).GetStringAttribute("value");
        stringInfos[name] = value;
    }

    GetVariables().UnserializeFrom(element.GetChild("initialVariables", 0, "InitialVariables"));
}

void InitialInstance::SerializeTo(SerializerElement & element) const
{
    element.SetAttribute( "name", GetObjectName() );
    element.SetAttribute( "x", GetX() );
    element.SetAttribute( "y", GetY() );
    element.SetAttribute( "zOrder", GetZOrder() );
    element.SetAttribute( "layer", GetLayer() );
    element.SetAttribute( "angle", GetAngle() );
    element.SetAttribute( "customSize", HasCustomSize() );
    element.SetAttribute( "width", GetCustomWidth() );
    element.SetAttribute( "height", GetCustomHeight() );
    element.SetAttribute( "locked", IsLocked() );

    SerializerElement & floatPropElement = element.AddChild("numberProperties");
    floatPropElement.ConsiderAsArrayOf("property");
    for(std::map<gd::String, float>::const_iterator floatInfo = floatInfos.begin(); floatInfo != floatInfos.end(); ++floatInfo)
    {
        floatPropElement.AddChild("property")
            .SetAttribute("name", floatInfo->first)
            .SetAttribute("value", floatInfo->second);
    }

    SerializerElement & stringPropElement = element.AddChild("stringProperties");
    stringPropElement.ConsiderAsArrayOf("property");
    for(std::map<gd::String, gd::String>::const_iterator stringInfo = stringInfos.begin(); stringInfo != stringInfos.end(); ++stringInfo)
    {
        stringPropElement.AddChild("property")
            .SetAttribute("name", stringInfo->first)
            .SetAttribute("value", stringInfo->second);
    }

    GetVariables().SerializeTo(element.AddChild("initialVariables"));
}

#if defined(GD_IDE_ONLY)
std::map<gd::String, gd::PropertyDescriptor> InitialInstance::GetCustomProperties(gd::Project & project, gd::Layout & layout)
{
    //Find an object
    if ( layout.HasObjectNamed(GetObjectName()) )
        return layout.GetObject(GetObjectName()).GetInitialInstanceProperties(*this, project, layout);
    else if ( project.HasObjectNamed(GetObjectName()) )
        return project.GetObject(GetObjectName()).GetInitialInstanceProperties(*this, project, layout);

    std::map<gd::String, gd::PropertyDescriptor> nothing;
    return nothing;
}

bool InitialInstance::UpdateCustomProperty(const gd::String & name, const gd::String & value, gd::Project & project, gd::Layout & layout)
{
    if ( layout.HasObjectNamed(GetObjectName()) )
        return layout.GetObject(GetObjectName()).UpdateInitialInstanceProperty(*this, name, value, project, layout);
    else if ( project.HasObjectNamed(GetObjectName()) )
        return project.GetObject(GetObjectName()).UpdateInitialInstanceProperty(*this, name, value, project, layout);

    return false;
}

float InitialInstance::GetRawFloatProperty(const gd::String & name) const
{
	const auto & it = floatInfos.find(name);
	return it != floatInfos.end() ? it->second : 0;
}

const gd::String & InitialInstance::GetRawStringProperty(const gd::String & name) const
{
	if (!badStringProperyValue) badStringProperyValue = new gd::String("");

	const auto & it = stringInfos.find(name);
	return it != stringInfos.end() ? it->second : *badStringProperyValue;
}
#endif

}
